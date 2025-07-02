document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o editor CodeMirror
  const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    lineNumbers: true,
    theme: 'monokai',
    mode: 'javascript',
    lint: { lintOnChange: true },
    extraKeys: {
      'Ctrl-Space': 'autocomplete',
      'Alt-S': () => saveButton.click(),
      'Alt-E': () => exportButton.click()
    }
  });
  editor.focus(); // Foco automático no editor

  // Elementos do DOM
  const languageSelect = document.getElementById('language');
  const themeSelect = document.getElementById('theme');
  const saveButton = document.getElementById('save');
  const exportButton = document.getElementById('export');
  const exportTxtButton = document.getElementById('export-txt');
  const exportMdButton = document.getElementById('export-md');
  const formatButton = document.getElementById('format');
  const togglePreviewButton = document.getElementById('toggle-preview');
  const helpButton = document.getElementById('help');
  const closeHelpButton = document.getElementById('close-help');
  const autocompleteButton = document.getElementById('autocomplete');
  const helpSection = document.getElementById('help-section');
  const historyList = document.getElementById('history-list');
  const previewDiv = document.getElementById('preview');
  const consoleDiv = document.getElementById('console');
  let previewVisible = false;

  // Carrega histórico do localStorage com compressão
  let history = JSON.parse(LZString.decompress(localStorage.getItem('codeHistory')) || '[]') || [];

  // Mapeamento de linguagens e extensões
  const modeMap = {
    javascript: { name: 'javascript' },
    json: { name: 'javascript', json: true },
    html: 'htmlmixed',
    css: 'css',
    python: 'python',
    markdown: 'markdown',
    xml: 'xml',
    clike: 'clike',
    php: 'php',
    typescript: { name: 'javascript', typescript: true },
    sql: 'sql'
  };

  const extensionMap = {
    javascript: '.js',
    json: '.json',
    html: '.html',
    css: '.css',
    python: '.py',
    markdown: '.md',
    xml: '.xml',
    clike: '.cpp',
    php: '.php',
    typescript: '.ts',
    sql: '.sql'
  };

  // Carregamento dinâmico de modos
  const loadMode = (language) => {
    const modeFiles = {
      clike: 'lib/codemirror/mode/clike.js',
      css: 'lib/codemirror/mode/css.js',
      html: 'lib/codemirror/mode/htmlmixed.js',
      javascript: 'lib/codemirror/mode/javascript.js',
      markdown: 'lib/codemirror/mode/markdown.js',
      python: 'lib/codemirror/mode/python.js',
      xml: 'lib/codemirror/mode/xml.js',
      php: 'lib/codemirror/mode/php.js',
      sql: 'lib/codemirror/mode/sql.js',
      typescript: 'lib/codemirror/mode/javascript.js'
    };
    if (modeFiles[language] && !document.querySelector(`script[src="${modeFiles[language]}"]`)) {
      const script = document.createElement('script');
      script.src = modeFiles[language];
      document.head.appendChild(script);
    }
  };

  // Snippets personalizados
  const snippets = {
    javascript: {
      'for': 'for (let i = 0; i < 10; i++) {\n  \n}',
      'func': 'function myFunction() {\n  \n}'
    },
    python: {
      'def': 'def my_function():\n    pass',
      'for': 'for i in range(10):\n    pass'
    }
  };

  CodeMirror.registerHelper('hint', 'customSnippets', (editor) => {
    const cursor = editor.getCursor();
    const token = editor.getTokenAt(cursor);
    const language = languageSelect.value;
    if (!snippets[language]) return;
    const matches = Object.keys(snippets[language]).filter(key => key.startsWith(token.string));
    if (matches.length) {
      return {
        list: matches.map(key => ({
          text: snippets[language][key],
          displayText: key
        })),
        from: CodeMirror.Pos(cursor.line, token.start),
        to: CodeMirror.Pos(cursor.line, token.end)
      };
    }
  });

  // Atualiza pré-visualização
  const updatePreview = () => {
    const language = languageSelect.value;
    const code = editor.getValue();
    try {
      if (language === 'html') {
        previewDiv.innerHTML = code;
      } else if (language === 'markdown') {
        const converter = new showdown.Converter();
        previewDiv.innerHTML = converter.makeHtml(code);
      } else {
        previewDiv.innerHTML = '<p>Pré-visualização não suportada para esta linguagem.</p>';
      }
      if (language === 'javascript' && previewVisible) {
        consoleDiv.innerHTML = '';
        const originalConsoleLog = console.log;
        console.log = (...args) => {
          consoleDiv.innerHTML += args.join(' ') + '<br>';
        };
        try {
          eval(code);
        } catch (e) {
          consoleDiv.innerHTML = `Erro: ${e.message}`;
        }
        console.log = originalConsoleLog;
      }
    } catch (e) {
      previewDiv.innerHTML = '<p>Erro na pré-visualização.</p>';
    }
  };

  // Carrega histórico
  const loadHistory = () => {
    historyList.innerHTML = '';
    history.forEach((item, index) => {
      const li = document.createElement('li');
      li.innerHTML = `${item.name} (${item.language}) 
        <button onclick="loadFile(${index})" aria-label="Carregar ${item.name}">Carregar</button>
        <button onclick="deleteFile(${index})" aria-label="Excluir ${item.name}">Excluir</button>`;
      historyList.appendChild(li);
    });
  };

  // Valida nomes de arquivos
  const validateFileName = (name) => {
    const invalidChars = /[\/\\:*?"<>|]/;
    return !invalidChars.test(name) && name.trim() !== '';
  };

  // Carrega arquivo do histórico
  window.loadFile = (index) => {
    try {
      const item = history[index];
      editor.setValue(item.content);
      languageSelect.value = item.language;
      loadMode(item.language);
      setTimeout(() => editor.setOption('mode', modeMap[item.language]), 100);
      alert(`Arquivo ${item.name} carregado.`);
    } catch (e) {
      alert('Erro ao carregar arquivo.');
    }
  };

  // Exclui arquivo do histórico
  window.deleteFile = (index) => {
    if (confirm(`Excluir ${history[index].name}?`)) {
      history.splice(index, 1);
      localStorage.setItem('codeHistory', LZString.compress(JSON.stringify(history)));
      loadHistory();
      alert('Arquivo excluído.');
    }
  };

  // Eventos
  languageSelect.addEventListener('change', () => {
    const mode = modeMap[languageSelect.value];
    loadMode(languageSelect.value);
    setTimeout(() => editor.setOption('mode', mode), 100);
    updatePreview();
  });

  themeSelect.addEventListener('change', () => {
    editor.setOption('theme', themeSelect.value);
  });

  saveButton.addEventListener('click', () => {
    const name = prompt('Digite o nome do arquivo:');
    if (name && validateFileName(name)) {
      const content = editor.getValue();
      const language = languageSelect.value;
      history.push({ name, content, language });
      localStorage.setItem('codeHistory', LZString.compress(JSON.stringify(history)));
      loadHistory();
      alert('Arquivo salvo.');
    } else {
      alert('Nome de arquivo inválido.');
    }
  });

  exportButton.addEventListener('click', () => {
    const name = prompt('Digite o nome do arquivo ZIP:');
    if (name && validateFileName(name)) {
      if (typeof JSZip === 'undefined') {
        const script = document.createElement('script');
        script.src = 'lib/jszip/jszip.min.js';
        script.onload = () => exportZip(name);
        document.head.appendChild(script);
      } else {
        exportZip(name);
      }
    } else {
      alert('Nome de arquivo inválido.');
    }
  });

  const exportZip = (name) => {
    try {
      const zip = new JSZip();
      history.forEach(item => {
        zip.file(`${item.name}${extensionMap[item.language]}`, item.content);
      });
      zip.file(`current-code${extensionMap[languageSelect.value]}`, editor.getValue());
      zip.generateAsync({ type: 'blob' }).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        alert('ZIP exportado.');
      });
    } catch (e) {
      alert('Erro ao exportar ZIP.');
    }
  };

  exportTxtButton.addEventListener('click', () => {
    const name = prompt('Digite o nome do arquivo TXT:');
    if (name && validateFileName(name)) {
      const code = editor.getValue();
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      alert('Arquivo TXT exportado.');
    } else {
      alert('Nome de arquivo inválido.');
    }
  });

  exportMdButton.addEventListener('click', () => {
    const name = prompt('Digite o nome do arquivo MD:');
    if (name && validateFileName(name)) {
      const code = editor.getValue();
      const blob = new Blob([code], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.md`;
      a.click();
      URL.revokeObjectURL(url);
      alert('Arquivo MD exportado.');
    } else {
      alert('Nome de arquivo inválido.');
    }
  });

  formatButton.addEventListener('click', () => {
    const language = languageSelect.value;
    const code = editor.getValue();
    try {
      let formatted;
      if (['javascript', 'json', 'typescript'].includes(language)) {
        formatted = prettier.format(code, { parser: 'babel', semi: true });
      } else if (language === 'html') {
        formatted = prettier.format(code, { parser: 'html' });
      } else if (language === 'css') {
        formatted = prettier.format(code, { parser: 'css' });
      } else {
        alert('Formatação não suportada para esta linguagem.');
        return;
      }
      editor.setValue(formatted);
      alert('Código formatado.');
    } catch (e) {
      alert('Erro ao formatar o código.');
    }
  });

  togglePreviewButton.addEventListener('click', () => {
    previewVisible = !previewVisible;
    previewDiv.style.display = previewVisible ? 'block' : 'none';
    consoleDiv.style.display = previewVisible && languageSelect.value === 'javascript' ? 'block' : 'none';
    if (previewVisible) updatePreview();
  });

  editor.on('change', () => {
    if (previewVisible) updatePreview();
  });

  helpButton.addEventListener('click', () => {
    helpSection.style.display = 'block';
  });

  closeHelpButton.addEventListener('click', () => {
    helpSection.style.display = 'none';
  });

  autocompleteButton.addEventListener('click', () => {
    editor.execCommand('autocomplete');
  });

  loadHistory();
});