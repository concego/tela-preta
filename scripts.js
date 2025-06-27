const CONFIG = {
  languages: {
    'text/html': { name: 'HTML', exts: ['html', 'htm'], file: 'index.html' },
    'text/css': { name: 'CSS', exts: ['css'], file: 'styles.css' },
    'text/javascript': { name: 'JavaScript', exts: ['js', 'ts', 'tsx'], file: 'script.js' },
    'text/x-python': { name: 'Python', exts: ['py'], file: 'script.py' },
    'text/x-csrc': { name: 'C', exts: ['c', 'cpp', 'h'], file: 'main.c' },
    'text/markdown': { name: 'Markdown', exts: ['md'], file: 'README.md' },
    'text/x-sql': { name: 'SQL', exts: ['sql'], file: 'query.sql' },
    'text/x-java': { name: 'Java', exts: ['java'], file: 'Main.java' },
    'text/x-kotlin': { name: 'Kotlin', exts: ['kt'], file: 'Main.kt' },
    'application/x-httpd-php': { name: 'PHP', exts: ['php'], file: 'index.php' },
    'application/json': { name: 'JSON', exts: ['json'], file: 'data.json' },
    'text/plain': { name: 'Texto', exts: ['txt'], file: 'newfile.txt' }
  }
};

let editors = [];
let activeEditorIndex = 0;

function setStatus(message) {
  const status = document.getElementById('status');
  status.textContent = message;
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const updatePreviewDebounced = debounce(updatePreview, 300);

function addEditor() {
  const editorId = editors.length;
  const editorDiv = document.createElement('div');
  editorDiv.className = 'editor';
  editorDiv.innerHTML = `
    <input type="text" id="filePathInput${editorId}" placeholder="Caminho do arquivo (ex.: src/index.js)" aria-label="Caminho do arquivo para editor ${editorId + 1}">
    <textarea id="codeFallback${editorId}"></textarea>
    <button onclick="selectEditor(${editorId})" aria-label="Selecionar editor ${editorId + 1} como ativo">Selecionar</button>
    <input type="checkbox" id="includeEditor${editorId}" checked aria-label="Incluir editor ${editorId + 1} ao salvar ou baixar">
    <label for="includeEditor${editorId}">Incluir ao salvar/baixar</label>
    <pre id="validationErrors${editorId}"></pre>
  `;
  document.querySelector('.editors').appendChild(editorDiv);
  const textarea = document.getElementById(`codeFallback${editorId}`);
  const editor = CodeMirror.fromTextArea(textarea, {
    lineNumbers: true,
    mode: 'text/plain',
    maxlength: 500000
  });
  editors.push({ editor, language: 'text/plain', filePath: 'newfile.txt', include: true });
  document.getElementById(`filePathInput${editorId}`).addEventListener('input', () => changeLanguage(editorId));
  editor.on('change', () => {
    localStorage.setItem(`savedCode${editorId}`, editor.getValue());
    if (activeEditorIndex === editorId) updatePreviewDebounced();
  });
  editor.on('paste', (cm, event) => checkPastedCode(cm, event, editorId));
  setStatus(`Editor ${editorId + 1} adicionado`);
}

function selectEditor(index) {
  activeEditorIndex = index;
  setStatus(`Editor ${index + 1} selecionado como ativo`);
  updatePreviewDebounced();
}

function changeLanguage(editorId) {
  const filePathInput = document.getElementById(`filePathInput${editorId}`);
  const filePath = filePathInput.value.trim();
  if (!/^[a-zA-Z0-9\/\-_\.]+$/.test(filePath)) {
    setStatus(`Nome de arquivo inválido no editor ${editorId + 1}. Use apenas letras, números, /, -, _, e .`);
    filePathInput.value = CONFIG.languages['text/plain'].file;
    return;
  }
  const ext = filePath.split('.').pop().toLowerCase();
  const langEntry = Object.entries(CONFIG.languages).find(([_, lang]) => lang.exts.includes(ext));
  const mode = langEntry ? langEntry[0] : 'text/plain';
  editors[editorId].language = mode;
  editors[editorId].editor.setOption('mode', mode);
  editors[editorId].filePath = filePath || CONFIG.languages[mode].file;
  localStorage.setItem(`savedLanguage${editorId}`, mode);
  localStorage.setItem(`savedFilePath${editorId}`, editors[editorId].filePath);
  if (activeEditorIndex === editorId) {
    updatePreviewDebounced();
  }
  setStatus(`Linguagem do editor ${editorId + 1} definida como ${CONFIG.languages[mode].name} (.${ext || CONFIG.languages[mode].exts[0]})${!langEntry ? ', extensão inválida' : ''}`);
}

function checkPastedCode(cm, event, editorId = null) {
  const pastedText = event.clipboardData?.getData('text') || '';
  const currentText = cm ? cm.getValue() : document.getElementById(`codeFallback${editorId}`).value;
  const normalize = text => text.replace(/\s+/g, ' ').trim();
  if (pastedText && normalize(pastedText) !== normalize(currentText)) {
    setStatus(`Aviso: Código colado no editor ${editorId + 1} contém alterações. Verifique o conteúdo.`);
  }
}

function updatePreview() {
  const editor = editors[activeEditorIndex];
  const code = editor.editor.getValue();
  if (code.length > 500000) {
    setStatus(`Aviso: Código no editor ${activeEditorIndex + 1} excede 500.000 caracteres. Visualização desativada para melhorar desempenho.`);
    document.getElementById('preview').contentWindow.document.body.innerHTML = '';
    return;
  }
  if (editor.language === 'text/html') {
    document.getElementById('preview').contentWindow.document.open();
    document.getElementById('preview').contentWindow.document.write(code);
    document.getElementById('preview').contentWindow.document.close();
  } else if (editor.language === 'text/markdown') {
    document.getElementById('preview').contentWindow.document.body.innerHTML = marked(code);
  } else if (editor.language === 'application/json') {
    try {
      const formatted = JSON.stringify(JSON.parse(code), null, 2);
      document.getElementById('preview').contentWindow.document.body.textContent = formatted;
    } catch (e) {
      document.getElementById('preview').contentWindow.document.body.textContent = 'JSON inválido';
    }
  } else {
    document.getElementById('preview').contentWindow.document.body.textContent = code;
  }
}

function formatCode() {
  const editor = editors[activeEditorIndex];
  if (editor.language === 'application/json') {
    try {
      const code = editor.editor.getValue();
      const formatted = JSON.stringify(JSON.parse(code), null, 2);
      editor.editor.setValue(formatted);
      setStatus(`JSON no editor ${activeEditorIndex + 1} formatado com sucesso`);
    } catch (e) {
      setStatus(`Erro ao formatar JSON no editor ${activeEditorIndex + 1}: ${e.message}`);
    }
  } else {
    setStatus(`Formatação disponível apenas para JSON no editor ${activeEditorIndex + 1}`);
  }
}

function validateHTML(code) {
  const errors = [];
  if (!/<[a-z][\s\S]*>/i.test(code)) {
    errors.push('Código HTML inválido: nenhuma tag HTML encontrada');
  }
  return errors;
}

function validateCSS(code) {
  const errors = [];
  if (!/\{[\s\S]*\}/.test(code)) {
    errors.push('Código CSS inválido: nenhuma regra CSS encontrada');
  }
  return errors;
}

function validateJavaScript(code) {
  const errors = [];
  try {
    JSHint(code);
    if (JSHint.errors.length > 0) {
      JSHint.errors.forEach(err => {
        if (err) errors.push(`Linha ${err.line}: ${err.reason}`);
      });
    }
  } catch (e) {
    errors.push(`Erro de sintaxe: ${e.message}`);
  }
  return errors;
}

function validatePython(code) {
  const errors = [];
  if (!/def |class |import /.test(code)) {
    errors.push('Código Python inválido: nenhuma estrutura válida encontrada');
  }
  return errors;
}

function validateC(code) {
  const errors = [];
  if (!/#include |int main/.test(code)) {
    errors.push('Código C inválido: #include ou int main não encontrados');
  }
  return errors;
}

function validateMarkdown(code) {
  const errors = [];
  if (!/# |\[.*\]\(.*\)/.test(code)) {
    errors.push('Código Markdown inválido: nenhum título ou link encontrado');
  }
  return errors;
}

function validateSQL(code) {
  const errors = [];
  if (!/SELECT |INSERT |UPDATE |DELETE /.test(code)) {
    errors.push('Código SQL inválido: nenhum comando SQL válido encontrado');
  }
  return errors;
}

function validateJava(code) {
  const errors = [];
  if (!/public class /.test(code)) {
    errors.push('Código Java inválido: nenhuma classe pública encontrada');
  }
  return errors;
}

function validateKotlin(code) {
  const errors = [];
  if (!/fun main/.test(code)) {
    errors.push('Código Kotlin inválido: função main não encontrada');
  }
  return errors;
}

function validatePHP(code) {
  const errors = [];
  if (!/<\?php/.test(code)) {
    errors.push('Código PHP inválido: tag de abertura <?php não encontrada');
  }
  return errors;
}

function validateJSON(code) {
  const errors = [];
  try {
    JSON.parse(code);
  } catch (e) {
    errors.push(`JSON inválido: ${e.message}`);
  }
  return errors;
}

function validateCode(showAll = false) {
  const errors = [];
  editors.forEach((editorObj, index) => {
    if (!showAll && !editorObj.include) return;
    const code = editorObj.editor.getValue();
    const lang = editorObj.language;
    const filePath = editorObj.filePath;
    const ext = filePath.split('.').pop().toLowerCase();
    let result = [];
    if (lang === 'text/html') {
      result = validateHTML(code);
    } else if (lang === 'text/css') {
      result = validateCSS(code);
    } else if (lang === 'text/javascript' || lang === 'text/typescript') {
      result = validateJavaScript(code);
      if (ext === 'tsx') {
        if (!code.includes('React')) {
          result.push('TSX requer importação do React (ex.: import React from "react";)');
        }
        if (!/<[A-Za-z][\s\S]*>/.test(code)) {
          result.push('TSX deve conter elementos JSX (ex.: <div>Hello</div>)');
        }
      }
    } else if (lang === 'text/x-python') {
      result = validatePython(code);
    } else if (lang === 'text/x-csrc') {
      result = validateC(code);
    } else if (lang === 'text/markdown') {
      result = validateMarkdown(code);
    } else if (lang === 'text/x-sql') {
      result = validateSQL(code);
    } else if (lang === 'text/x-java') {
      result = validateJava(code);
    } else if (lang === 'text/x-kotlin') {
      result = validateKotlin(code);
    } else if (lang === 'application/x-httpd-php') {
      result = validatePHP(code);
    } else if (lang === 'application/json') {
      result = validateJSON(code);
    }
    if (result.length > 0) {
      errors.push(`Editor ${index + 1} (${filePath}): ${result.join(', ')}`);
    }
    document.getElementById(`validationErrors${index}`).textContent = result.length > 0 ? result.join('\n') : 'Nenhum erro encontrado';
  });
  const validationErrors = document.getElementById('validationErrors');
  const errorSummary = errors.length > 0 ? `Encontrados ${errors.length} erro(s) em ${errors.length} editor(es)` : 'Nenhum erro encontrado nos editores selecionados';
  validationErrors.textContent = errors.length > 0 ? `${errorSummary}\n${errors.join('\n')}` : errorSummary;
  setStatus(`Validação concluída: ${errorSummary}`);
}

function showSupportedFormats() {
  const formatsList = document.getElementById('formatsList');
  formatsList.innerHTML = Object.entries(CONFIG.languages).map(([mode, lang]) => `
    <li role="option">
      <button onclick="changeLanguage(${activeEditorIndex}, '${mode}')" aria-label="Selecionar formato ${lang.name}">
        ${lang.name} (.${lang.exts.join(', .')})
      </button>
    </li>
  `).join('');
  const dialog = document.getElementById('formatsDialog');
  dialog.showModal();
  dialog.querySelector('button')?.focus();
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dialog.close();
      setStatus('Diálogo de formatos suportados fechado');
    }
  });
  setStatus('Diálogo de formatos suportados aberto');
}

function openDownloadDialog() {
  const downloadList = document.getElementById('downloadList');
  downloadList.innerHTML = editors.map((editor, index) => `
    <li>
      <input type="checkbox" id="downloadEditor${index}" ${editor.include ? 'checked' : ''} aria-label="Incluir editor ${index + 1} no download">
      <label for="downloadEditor${index}">${editor.filePath}</label>
    </li>
  `).join('');
  const dialog = document.getElementById('downloadDialog');
  dialog.addEventListener('close', () => {
    if (dialog.returnValue === 'default') {
      editors.forEach((editor, index) => {
        const checkbox = document.getElementById(`downloadEditor${index}`);
        if (checkbox.checked) {
          const blob = new Blob([editor.editor.getValue()], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = editor.filePath;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
      setStatus('Arquivos selecionados baixados');
    }
  }, { once: true });
  dialog.showModal();
  dialog.querySelector('button')?.focus();
  setStatus('Diálogo de download aberto');
}

function downloadAsZip() {
  const zip = new JSZip();
  let includedFiles = 0;
  editors.forEach((editor) => {
    if (editor.include) {
      zip.file(editor.filePath, editor.editor.getValue());
      includedFiles++;
    }
  });
  if (includedFiles === 0) {
    setStatus('Nenhum editor selecionado para download');
    return;
  }
  zip.generateAsync({ type: 'blob' }).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tela-preta.zip';
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Arquivos baixados como ZIP');
  });
}

document.getElementById('formatButton').addEventListener('click', formatCode);
document.getElementById('validateButton').addEventListener('click', validateCode);
document.getElementById('downloadButton').addEventListener('click', openDownloadDialog);
document.getElementById('zipButton').addEventListener('click', downloadAsZip);

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    editors.forEach((editor, index) => {
      if (editor.include) {
        localStorage.setItem(`savedCode${index}`, editor.editor.getValue());
      }
    });
    setStatus('Códigos salvos localmente');
  } else if (e.ctrlKey && e.key === 'v') {
    e.preventDefault();
    validateCode(true);
  } else if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    downloadAsZip();
  } else if (e.ctrlKey && e.key === 'k') {
    e.preventDefault();
    editors.forEach((editor, index) => {
      if (editor.language === 'text/x-kotlin' && editor.include) {
        const errors = validateKotlin(editor.editor.getValue());
        document.getElementById(`validationErrors${index}`).textContent = errors.length > 0 ? errors.join('\n') : 'Nenhum erro encontrado';
      }
    });
    setStatus('Validação de Kotlin concluída');
  }
});

window.addEventListener('load', () => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('savedCode')) {
      const editorId = parseInt(key.replace('savedCode', ''));
      addEditor();
      editors[editorId].editor.setValue(localStorage.getItem(`savedCode${editorId}`) || '');
      const savedLanguage = localStorage.getItem(`savedLanguage${editorId}`) || 'text/plain';
      const savedFilePath = localStorage.getItem(`savedFilePath${editorId}`) || CONFIG.languages[savedLanguage].file;
      document.getElementById(`filePathInput${editorId}`).value = savedFilePath;
      editors[editorId].language = savedLanguage;
      editors[editorId].filePath = savedFilePath;
      editors[editorId].editor.setOption('mode', savedLanguage);
    }
  }
  if (editors.length === 0) {
    addEditor();
  }
  selectEditor(0);
});