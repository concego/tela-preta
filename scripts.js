document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o editor CodeMirror
  const loadingDiv = document.getElementById('loading');
  const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    lineNumbers: true,
    theme: 'monokai',
    mode: 'javascript',
    lint: { lintOnChange: true },
    extraKeys: {
      'Ctrl-Space': 'autocomplete',
      'Alt-S': () => saveButton.click(),
      'Alt-E': () => exportButton.click(),
      'Alt-D': () => downloadButton.click(),
      'Alt-C': () => clearButton.click(),
      'Alt-L': () => languagesButton.click()
    }
  });
  editor.focus();
  loadingDiv.style.display = 'none';

  // Elementos do DOM
  const themeSelect = document.getElementById('theme');
  const saveButton = document.getElementById('save');
  const downloadButton = document.getElementById('download');
  const exportButton = document.getElementById('export');
  const exportTxtButton = document.getElementById('export-txt');
  const exportMdButton = document.getElementById('export-md');
  const formatButton = document.getElementById('format');
  const togglePreviewButton = document.getElementById('toggle-preview');
  const clearButton = document.getElementById('clear');
  const languagesButton = document.getElementById('languages');
  const closeLanguagesButton = document.getElementById('close-languages');
  const helpButton = document.getElementById('help');
  const closeHelpButton = document.getElementById('close-help');
  const autocompleteButton = document.getElementById('autocomplete');
  const languagesSection = document.getElementById('languages-section');
  const languagesList = document.getElementById('languages-list');
  const helpSection = document.getElementById('help-section');
  const historyList = document.getElementById('history-list');
  const previewDiv = document.getElementById('preview');
  const consoleDiv = document.getElementById('console');
  let previewVisible = false;
  let currentMode = 'javascript';

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
    sql: 'sql',
    ruby: 'ruby',
    go: 'go'
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
    sql: '.sql',
    ruby: '.rb',
    go: '.go'
  };

  // Carregamento assíncrono de modos via CDN
  const loadMode = (language) => {
    const modeFiles = {
      clike: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/clike/clike.min.js',
      css: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/css/css.min.js',
      html: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/htmlmixed/htmlmixed.min.js',
      javascript: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/javascript/javascript.min.js',
      markdown: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/markdown/markdown.min.js',
      python: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/python/python.min.js',
      xml: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/xml/xml.min.js',
      php: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/php/php.min.js',
      sql: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/sql/sql.min.js',
      ruby: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/ruby/ruby.min.js',
      go: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/go/go.min.js'
    };
    if (modeFiles[language] && !document.querySelector(`script[src="${modeFiles[language]}"]`)) {
      const script = document.createElement('script');
      script.src = modeFiles[language];
      script.async = true;
      document.head.appendChild(script);
    }
  };

  // Detecção automática de linguagem
  const detectLanguage = (content) => {
    if (content.startsWith('<?php')) return 'php';
    if (content.match(/^\s*SELECT\s/i)) return 'sql';
    if (content.match(/^\s*class\s.*\s{.*$/)) return 'typescript';
    if (content.match(/^\s*def\s/)) return 'python';
    if (content.match(/^\s*#/)) return 'markdown';
    if (content.match(/^\s*<\w+/)) return 'html';
    if (content.match(/^\s*\w+\s*:/)) return 'css';
    if (content.match(/^\s*func\s/)) return 'go';
    if (content.match(/^\s*def\s.*\(.*\):/)) return 'ruby';
    if (content.match(/^\s*\/\/.*$/)) return 'clike';
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      return 'javascript';
    }
  };

  // Atualiza o modo com base no conteúdo
  const updateMode = () => {
    const content = editor.getValue();
    const detected = detectLanguage(content);
    currentMode = detected;
    loadMode(detected);
    setTimeout(() => editor.setOption('mode', modeMap[detected]), 100);
  };

  // Cache de snippets no localStorage
  const snippets = JSON.parse(localStorage.getItem('snippets')) || {
    javascript: { 'for': 'for (let i = 0; i < 10; i++) {\n  \n}', 'func': 'function myFunction() {\n  \n}' },
    python: { 'def': 'def my_function():\n    pass', 'for': 'for i in range(10):\n    pass' },
    ruby: { 'def': 'def my_method\n  \nend', 'each': 'array.each do |item|\n  \nend' },
    go: { 'func': 'func myFunction() {\n  \n}', 'for': 'for i := 0; i < 10; i++ {\n  \n}' },
    sql: { 'select': 'SELECT * FROM table WHERE condition;' },
    php: { 'function': '<?php\nfunction myFunction() {\n  \n}\n?>' },
    typescript: { 'interface': 'interface MyInterface {\n  \n}' }
  };
  localStorage.setItem('snippets', JSON.stringify(snippets));

  CodeMirror.registerHelper('hint', 'customSnippets', (editor) => {
    const cursor = editor.getCursor();
    const token = editor.getTokenAt(cursor);
    const matches = Object.keys(snippets[currentMode] || {}).filter(key => key.startsWith(token.string));
    if (matches.length) {
      return {
        list: matches.map(key => ({
          text: snippets[currentMode][key],
          displayText: key
        })),
        from: CodeMirror.Pos(cursor.line, token.start),
        to: CodeMirror.Pos(cursor.line, token.end)
      };
    }
  });

  // Atualiza pré-visualização com requestAnimationFrame
  const updatePreview = () => {
    requestAnimationFrame(() => {
      const language = currentMode;
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
    });
  };

  // Carrega histórico
  const loadHistory = () => {
    historyList.innerHTML = '';
    history.forEach((item, index) => {
      const li = document.createElement('li');
      li.innerHTML = `${item.name}${item.extension} (${item.language}) 
        <button onclick="loadFile(${index})" aria-label="Carregar ${item.name}${item.extension}">Carregar</button>
        <button onclick="deleteFile(${index})" aria-label="Excluir ${item.name}${item.extension}">Excluir</button>`;
      historyList.appendChild(li);
    });
  };

  // Exibe linguagens suportadas
  const loadLanguages = () => {
    languagesList.innerHTML = '';
    Object.keys(modeMap).forEach(lang => {
      const li = document.createElement('li');
      li.textContent = lang.charAt(0).toUpperCase() + lang.slice(1);
      languagesList.appendChild(li);
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
      currentMode = item.language;
      loadMode(item.language);
      setTimeout(() => editor.setOption('mode', modeMap[item.language]), 100);
      alert(`Arquivo ${item.name}${item.extension} carregado.`);
    } catch (e) {
      alert('Erro ao carregar arquivo.');
    }
  };

  // Exclui arquivo do histórico
  window.deleteFile = (index) => {
    if (confirm(`Excluir ${history[index].name}${history[index].extension}?`)) {
      history.splice(index, 1);
      localStorage.setItem('codeHistory', LZString.compress(JSON.stringify(history)));
      loadHistory();
      alert('Arquivo excluído.');
    }
  };

  // Eventos
  editor.on('change', () => {
    updateMode();
    if (previewVisible) updatePreview();
  });

  themeSelect.addEventListener('change', () => {
    editor.setOption('theme', themeSelect.value);
  });

  saveButton.addEventListener('click', () => {
    const name = prompt('Digite o nome do arquivo:');
    if (name && validateFileName(name)) {
      const extension = prompt('Digite a extensão (ex.: .js, .json):', extensionMap[currentMode]);
      if (!extension.startsWith('.')) {
        alert('A extensão deve começar com um ponto (ex.: .js).');
        return;
      }
      const content = editor.getValue();
      const language = currentMode;
      history.push({ name, extension, content, language });
      localStorage.setItem('codeHistory', LZString.compress(JSON.stringify(history)));
      loadHistory();
      alert(`Arquivo ${name}${extension} salvo.`);
    } else {
      alert('Nome de arquivo inválido.');
    }
  });

  downloadButton.addEventListener('click', () => {
    const name = prompt('Digite o nome do arquivo:');
    if (name && validateFileName(name)) {
      const extension = prompt('Digite a extensão (ex.: .js, .json):', extensionMap[currentMode]);
      if (!extension.startsWith('.')) {
        alert('A extensão deve começar com um ponto (ex.: .js).');
        return;
      }
      const code = editor.getValue();
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}${extension}`;
      a.click();
      URL.revokeObjectURL(url);
      alert('Arquivo baixado.');
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
        script.async = true;
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
        zip.file(`${item.name}${item.extension}`, item.content);
      });
      zip.file(`current-code${extensionMap[currentMode]}`, editor.getValue());
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
    const language = currentMode;
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
    consoleDiv.style.display = previewVisible && currentMode === 'javascript' ? 'block' : 'none';
    if (previewVisible) updatePreview();
  });

  clearButton.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar o editor?')) {
      editor.setValue('');
      currentMode = 'javascript';
      loadMode(currentMode);
      setTimeout(() => editor.setOption('mode', modeMap[currentMode]), 100);
      alert('Editor limpo.');
    }
  });

  languagesButton.addEventListener('click', () => {
    languagesSection.style.display = 'block';
    loadLanguages();
  });

  closeLanguagesButton.addEventListener('click', () => {
    languagesSection.style.display = 'none';
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