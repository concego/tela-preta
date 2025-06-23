const CONFIG = {
  languages: {
    'text/plain': { ext: 'txt', name: 'Texto Simples' },
    'text/html': { ext: 'html', name: 'HTML', file: 'index.html' },
    'text/css': { ext: 'css', name: 'CSS', file: 'styles.css' },
    'text/javascript': { ext: 'js', name: 'JavaScript', file: 'scripts.js' },
    'text/x-python': { ext: 'py', name: 'Python', file: 'code.py' },
    'text/x-csrc': { ext: 'c', name: 'C', file: 'code.c' },
    'text/markdown': { ext: 'md', name: 'Markdown', file: 'code.md' },
    'text/typescript': { ext: 'ts', name: 'TypeScript', file: 'code.ts' },
    'text/x-sql': { ext: 'sql', name: 'SQL', file: 'code.sql' },
    'text/x-java': { ext: 'java', name: 'Java', file: 'Main.java' },
    'text/x-kotlin': { ext: 'kt', name: 'Kotlin', file: 'Main.kt' },
    'application/x-httpd-php': { ext: 'php', name: 'PHP', file: 'index.php' }
  },
  templates: {
    'index.html': `<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Meu Projeto</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1>Bem-vindo ao meu projeto</h1>\n  <script src="scripts.js"></script>\n</body>\n</html>`,
    'styles.css': `body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background-color: #f0f0f0;\n}\nh1 {\n  color: #333;\n}`,
    'scripts.js': `console.log("Olá, mundo!");`,
    'code.py': `print("Olá, mundo!")`,
    'code.c': `#include <stdio.h>\nint main() {\n  printf("Olá, mundo!\\n");\n  return 0;\n}`,
    'code.md': `# Meu Projeto\n\nBem-vindo ao meu projeto!`,
    'code.ts': `console.log("Olá, mundo!");`,
    'code.sql': `SELECT * FROM users;`,
    'Main.java': `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Olá, mundo!");\n  }\n}`,
    'Main.kt': `fun main() {\n  println("Olá, mundo!")\n}`,
    'index.php': `<?php\necho "Olá, mundo!";\n?>`
  }
};

let editor;
let isDarkTheme = true;

function initializeEditor() {
  editor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
    lineNumbers: true,
    mode: 'text/plain',
    theme: 'monokai',
    tabSize: 2,
    indentWithTabs: true
  });
  editor.on('change', debounce(() => {
    updatePreview();
    validateCode(true);
  }, 500));
  loadSavedCode();
  if (navigator.userAgent.includes('TalkBack')) {
    updateFallback(true);
  }
  loadSavedLanguage();
  document.addEventListener('keydown', handleShortcuts);
}

function handleShortcuts(e) {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    saveCode();
  } else if (e.ctrlKey && e.key === 'v') {
    e.preventDefault();
    validateCode();
  } else if (e.ctrlKey && e.key === 'e') {
    e.preventDefault();
    exportCode();
  } else if (e.ctrlKey && e.key === 'k') {
    e.preventDefault();
    if (document.getElementById('languageSelect').value === 'text/x-kotlin') {
      validateCode();
    }
  }
}

function updateFallback(show) {
  const fallback = document.getElementById('codeFallback');
  document.getElementById('codeEditor').style.display = show ? 'none' : 'block';
  fallback.style.display = show ? 'block' : 'none';
  if (show) {
    fallback.value = editor.getValue();
    fallback.addEventListener('input', () => editor.setValue(fallback.value));
  }
}

function changeLanguage() {
  const select = document.getElementById('languageSelect');
  editor.setOption('mode', select.value);
  localStorage.setItem('savedLanguage', select.value);
  updatePreview();
  setStatus(`Linguagem alterada para ${select.options[select.selectedIndex].text}`);
}

function saveCode() {
  localStorage.setItem('savedCode', editor.getValue());
  setStatus('Código salvo com sucesso');
}

function loadSavedCode() {
  const savedCode = localStorage.getItem('savedCode');
  if (savedCode) {
    editor.setValue(savedCode);
    if (navigator.userAgent.includes('TalkBack')) {
      document.getElementById('codeFallback').value = savedCode;
    }
  }
}

function loadSavedLanguage() {
  const savedLanguage = localStorage.getItem('savedLanguage');
  if (savedLanguage) {
    document.getElementById('languageSelect').value = savedLanguage;
    editor.setOption('mode', savedLanguage);
  }
}

function exportCode() {
  const zip = new JSZip();
  const code = editor.getValue();
  const lang = document.getElementById('languageSelect').value;
  const filename = ['text/x-kotlin', 'text/x-java'].includes(lang) ? `src/${CONFIG.languages[lang].file}` : CONFIG.languages[lang].file;
  zip.file(filename, code);
  downloadZip(zip, 'code.zip', 'Código exportado como ZIP');
}

function exportMultipleFiles() {
  const zip = new JSZip();
  const code = editor.getValue();
  const lang = document.getElementById('languageSelect').value;
  Object.keys(CONFIG.templates).forEach(file => {
    const content = CONFIG.languages[lang]?.file === file ? code || CONFIG.templates[file] : CONFIG.templates[file];
    const path = ['Main.kt', 'Main.java'].includes(file) ? `src/${file}` : file;
    zip.file(path, content);
  });
  if (lang === 'text/x-kotlin') {
    zip.file('build.gradle.kts', `plugins {\n  kotlin("jvm") version "1.9.0"\n}\nrepositories {\n  mavenCentral()\n}\ndependencies {\n  implementation(kotlin("stdlib"))\n}`);
  } else if (lang === 'text/x-java') {
    zip.file('pom.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<project>\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>com.example</groupId>\n  <artifactId>project</artifactId>\n  <version>1.0-SNAPSHOT</version>\n</project>`);
  } else if (lang === 'application/x-httpd-php') {
    zip.file('composer.json', `{\n  "name": "project",\n  "description": "Projeto PHP",\n  "require": {\n    "php": ">=7.4"\n  }\n}\n`);
  }
  downloadZip(zip, 'project.zip', 'Arquivos múltiplos exportados como ZIP');
}

function openDownloadDialog() {
  const dialog = document.getElementById('downloadDialog');
  dialog.showModal();
  dialog.querySelector('input[name="files"]').focus();
  dialog.querySelector('form').onsubmit = e => {
    e.preventDefault();
    const code = editor.getValue();
    const lang = document.getElementById('languageSelect').value;
    const files = Array.from(dialog.querySelectorAll('input[name="files"]:checked')).map(input => input.value);
    files.forEach(file => {
      const content = CONFIG.languages[lang]?.file === file ? code || CONFIG.templates[file] : CONFIG.templates[file];
      const path = ['Main.kt', 'Main.java'].includes(file) ? `src/${file}` : file;
      downloadFile(path, content);
    });
    setStatus(`Arquivos ${files.join(', ')} baixados com sucesso`);
    dialog.close();
  };
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

function downloadZip(zip, filename, statusMessage) {
  zip.generateAsync({ type: 'blob' }).then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    setStatus(statusMessage);
  });
}

function loadFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = Object.values(CONFIG.languages).map(lang => `.${lang.ext}`).join(',');
  input.onchange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        editor.setValue(event.target.result);
        if (navigator.userAgent.includes('TalkBack')) {
          document.getElementById('codeFallback').value = event.target.result;
        }
        const ext = file.name.split('.').pop();
        const lang = Object.keys(CONFIG.languages).find(key => CONFIG.languages[key].ext === ext);
        if (lang) {
          document.getElementById('languageSelect').value = lang;
          editor.setOption('mode', lang);
          localStorage.setItem('savedLanguage', lang);
        }
        setStatus(`Arquivo ${file.name} carregado com sucesso`);
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function runCode() {
  const code = editor.getValue();
  const lang = document.getElementById('languageSelect').value;
  const output = document.getElementById('output');
  output.style.display = 'block';
  if (lang === 'text/x-kotlin' || lang === 'text/x-java' || lang === 'application/x-httpd-php') {
    output.textContent = `Execução de ${CONFIG.languages[lang].name} não suportada diretamente no navegador. Use um compilador externo (ex.: JDoodle).`;
    setStatus('Execução indisponível');
  } else if (lang === 'text/javascript') {
    try {
      const result = eval(code);
      output.textContent = result !== undefined ? String(result) : 'Executado com sucesso';
      setStatus('Código executado com sucesso');
    } catch (e) {
      output.textContent = `Erro: ${e.message}`;
      setStatus('Erro na execução');
    }
  } else {
    output.textContent = 'Execução não suportada para esta linguagem.';
    setStatus('Execução indisponível');
  }
}

function validateHTML(code) {
  const errors = [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'text/html');
    if (doc.querySelector('parsererror')) {
      errors.push('Erro de sintaxe HTML: Estrutura inválida.');
    } else if (!code.includes('<html')) {
      errors.push('Aviso: Estrutura HTML incompleta (falta <html> ou <!DOCTYPE html>).');
    }
  } catch (e) {
    errors.push(`Erro de sintaxe HTML: ${e.message}`);
  }
  return errors;
}

function validateCSS(code) {
  const errors = [];
  if (!code.match(/([^{]+)\{([^}]*)\}/g) && code.trim()) {
    errors.push('Erro de sintaxe CSS: Estrutura inválida (ex.: seletor { propriedade: valor; }).');
  }
  return errors;
}

function validateJavaScript(code) {
  const errors = [];
  if (typeof JSHint !== 'undefined') {
    JSHint(code);
    errors.push(...JSHint.errors.map(err => `Erro na linha ${err.line}: ${err.reason}`));
  } else {
    try {
      new Function(code);
    } catch (e) {
      errors.push(`Erro de sintaxe: ${e.message}`);
    }
  }
  return errors;
}

function validatePython(code) {
  const errors = [];
  const lines = code.split('\n');
  lines.forEach((line, index) => {
    if (line.trim() && !line.startsWith('#')) {
      const spaces = line.match(/^\s*/)[0].length;
      if (spaces % 2 !== 0) {
        errors.push(`Erro de indentação na linha ${index + 1}: Use múltiplos de 2 espaços.`);
      }
      if (line.match(/^[ \t]*[a-zA-Z_]\w*\s*:/) && !line.includes('def ') && !line.includes('class ')) {
        errors.push(`Erro de sintaxe na linha ${index + 1}: Bloco inválido (ex.: falta 'def' ou 'class').`);
      }
    }
  });
  return errors;
}

function validateC(code) {
  const errors = [];
  if (!code.includes('main(')) {
    errors.push('Erro: Função main() não encontrada.');
  }
  const braceCount = (code.match(/{/g) || []).length - (code.match(/}/g) || []).length;
  if (braceCount !== 0) {
    errors.push(`Erro de sintaxe: ${braceCount > 0 ? 'Chaves abertas' : 'Chaves fechadas'} em excesso.`);
  }
  return errors;
}

function validateMarkdown(code) {
  const errors = [];
  if (code.trim() && !code.match(/^(#{1,6}\s.*|[*+-]\s.*|\[.*\]\(.*\)|>.*)$/gm)) {
    errors.push('Aviso: Estrutura Markdown inválida (ex.: use # para cabeçalhos, - para listas).');
  }
  return errors;
}

function validateTypeScript(code) {
  const errors = [];
  try {
    new Function(code);
  } catch (e) {
    errors.push(`Erro de sintaxe TypeScript: ${e.message}`);
  }
  return errors;
}

function validateSQL(code) {
  const errors = [];
  if (!code.match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP)\b.*;$/i) && code.trim()) {
    errors.push('Erro de sintaxe SQL: Estrutura inválida (ex.: SELECT * FROM tabela;).');
  }
  return errors;
}

function validateJava(code) {
  const errors = [];
  if (!code.match(/public\s+class\s+\w+/)) {
    errors.push('Erro: Classe pública não encontrada (ex.: public class Main).');
  }
  if (!code.match(/public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*\w+\s*\)/)) {
    errors.push('Aviso: Método main não encontrado (ex.: public static void main(String[] args)).');
  }
  const braceCount = (code.match(/{/g) || []).length - (code.match(/}/g) || []).length;
  if (braceCount !== 0) {
    errors.push(`Erro de sintaxe: ${braceCount > 0 ? 'Chaves abertas' : 'Chaves fechadas'} em excesso.`);
  }
  return errors;
}

function validateKotlin(code) {
  const errors = [];
  if (!code.match(/fun\s+main\s*\(\s*\)/)) {
    errors.push('Aviso: Função main não encontrada (ex.: fun main()).');
  }
  const braceCount = (code.match(/{/g) || []).length - (code.match(/}/g) || []).length;
  if (braceCount !== 0) {
    errors.push(`Erro de sintaxe: ${braceCount > 0 ? 'Chaves abertas' : 'Chaves fechadas'} em excesso.`);
  }
  if (code.match(/class\s+\w+\s*[^({]/) && !code.match(/class\s+\w+\s*{/)) {
    errors.push('Erro: Classe mal formada (ex.: class MinhaClasse { ... }).');
  }
  return errors;
}

function validatePHP(code) {
  const errors = [];
  if (!code.match(/<\?php\b/)) {
    errors.push('Erro: Tag de abertura <?php não encontrada.');
  }
  if (!code.match(/\?>/)) {
    errors.push('Aviso: Tag de fechamento ?> não encontrada.');
  }
  const braceCount = (code.match(/{/g) || []).length - (code.match(/}/g) || []).length;
  if (braceCount !== 0) {
    errors.push(`Erro de sintaxe: ${braceCount > 0 ? 'Chaves abertas' : 'Chaves fechadas'} em excesso.`);
  }
  return errors;
}

function validateCode(live = false) {
  const code = editor.getValue();
  const lang = document.getElementById('languageSelect').value;
  const validators = {
    'text/html': validateHTML,
    'text/css': validateCSS,
    'text/javascript': validateJavaScript,
    'text/x-python': validatePython,
    'text/x-csrc': validateC,
    'text/markdown': validateMarkdown,
    'text/typescript': validateTypeScript,
    'text/x-sql': validateSQL,
    'text/x-java': validateJava,
    'text/x-kotlin': validateKotlin,
    'application/x-httpd-php': validatePHP
  };
  const errors = validators[lang]?.(code) || ['Validação não disponível para Texto Simples.'];
  if (!live) {
    displayValidationResult(errors);
  } else if (errors.length > 0) {
    document.getElementById('validationErrors').textContent = errors.join(' ');
  } else {
    document.getElementById('validationErrors').textContent = '';
  }
}

function displayValidationResult(errors) {
  const status = document.getElementById('status');
  const validationErrors = document.getElementById('validationErrors');
  if (errors.length === 0) {
    status.textContent = 'Nenhum erro detectado no código.';
    validationErrors.textContent = '';
  } else {
    status.textContent = 'Erros encontrados no código.';
    validationErrors.textContent = errors.join(' ');
  }
}

function resetCode() {
  editor.setValue('');
  localStorage.removeItem('savedCode');
  localStorage.removeItem('savedLanguage');
  if (navigator.userAgent.includes('TalkBack')) {
    document.getElementById('codeFallback').value = '';
  }
  updatePreview();
  setStatus('Código resetado');
  document.getElementById('validationErrors').textContent = '';
}

function toggleTheme() {
  isDarkTheme = !isDarkTheme;
  editor.setOption('theme', isDarkTheme ? 'monokai' : 'default');
  document.body.style.backgroundColor = isDarkTheme ? '#1e1e1e' : '#fff';
  document.body.style.color = isDarkTheme ? '#fff' : '#000';
  setStatus(`Tema alterado para ${isDarkTheme ? 'escuro' : 'claro'}`);
}

function updatePreview() {
  const code = editor.getValue();
  const lang = document.getElementById('languageSelect').value;
  const preview = document.getElementById('preview');
  const previewText = document.getElementById('previewText');
  try {
    if (lang === 'text/html') {
      preview.contentDocument.open();
      preview.contentDocument.write(code);
      preview.contentDocument.close();
      previewText.textContent = 'Visualização HTML renderizada no iframe.';
    } else if (lang === 'text/markdown' && typeof marked !== 'undefined') {
      preview.contentDocument.body.innerHTML = marked.parse(code);
      previewText.textContent = 'Visualização Markdown renderizada.';
    } else if (lang === 'application/x-httpd-php') {
      preview.contentDocument.body.innerText = code;
      previewText.textContent = 'Código PHP com destaque de sintaxe (execução requer servidor).';
    } else {
      preview.contentDocument.body.innerText = code;
      previewText.textContent = CONFIG.languages[lang]?.name === 'Kotlin' ? 'Código Kotlin com destaque de sintaxe.' : CONFIG.languages[lang]?.name === 'Java' ? 'Código Java com destaque de sintaxe.' : code;
    }
  } catch (e) {
    setStatus(`Erro na visualização: ${e.message}`);
    previewText.textContent = `Erro: ${e.message}`;
  }
  if (navigator.userAgent.includes('TalkBack')) {
    preview.style.display = 'none';
    previewText.style.display = 'block';
  }
}

function setStatus(message) {
  document.getElementById('status').textContent = message;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

window.onload = initializeEditor;
