document.addEventListener('DOMContentLoaded', () => {
  // Inicializar CodeMirror
  const editor = CodeMirror(document.getElementById('editor'), {
    mode: 'javascript',
    theme: 'solarized light',
    lineNumbers: true,
    tabSize: 2,
    ariaLabel: 'Editor de código do Tela Preta 2',
    extraKeys: { 'Ctrl-Space': 'autocomplete' }
  });

  const liveRegion = document.getElementById('live-region');
  const helpSection = document.getElementById('help-section');
  const exportDialog = document.getElementById('export-dialog');
  const fileNameInput = document.getElementById('file-name');
  const fileNameError = document.getElementById('file-name-error');
  const helpButton = document.getElementById('help-button');
  const fileHistory = document.getElementById('file-history');

  // Carregar código salvo
  const savedCode = localStorage.getItem('code');
  if (savedCode) editor.setValue(savedCode);

  // Garantir que o editor seja focável e editável
  editor.getWrapperElement().setAttribute('tabindex', '0');
  editor.getWrapperElement().addEventListener('focus', () => {
    announce('Editor de código focado no Tela Preta 2. Use o teclado virtual para editar.');
  });
  editor.getWrapperElement().addEventListener('dblclick', () => {
    editor.focus();
    announce('Editor de código focado no Tela Preta 2. Use o teclado virtual para editar.');
  });

  // Validação de nome de arquivo
  function validateFileName(name) {
    const invalidChars = /[\/\\:*?"<>|]/;
    return !invalidChars.test(name) && name.trim().length > 0;
  }

  // Validação em tempo real
  fileNameInput.addEventListener('input', () => {
    const fileName = fileNameInput.value.trim();
    if (fileName && !validateFileName(fileName)) {
      fileNameError.classList.remove('hidden');
      announce('Nome de arquivo inválido. Use apenas letras, números, hífens ou sublinhados.');
    } else {
      fileNameError.classList.add('hidden');
    }
  });

  // Histórico de arquivos
  function loadFileHistory() {
    fileHistory.innerHTML = '';
    const files = Object.keys(localStorage).filter(key => key.startsWith('code_'));
    if (files.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Nenhum arquivo salvo.';
      fileHistory.appendChild(li);
      return;
    }
    files.forEach((key, index) => {
      const li = document.createElement('li');
      li.textContent = `Arquivo ${index + 1} (${key.replace('code_', '')})`;
      li.setAttribute('tabindex', '0');
      li.setAttribute('aria-label', `Carregar arquivo salvo ${index + 1} no Tela Preta 2`);
      li.addEventListener('click', () => {
        editor.setValue(localStorage.getItem(key));
        announce(`Arquivo ${index + 1} carregado no Tela Preta 2`);
        helpSection.classList.add('hidden');
        helpSection.setAttribute('aria-expanded', 'false');
        helpButton.setAttribute('aria-expanded', 'false');
        editor.focus();
      });
      li.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          editor.setValue(localStorage.getItem(key));
          announce(`Arquivo ${index + 1} carregado no Tela Preta 2`);
          helpSection.classList.add('hidden');
          helpSection.setAttribute('aria-expanded', 'false');
          helpButton.setAttribute('aria-expanded', 'false');
          editor.focus();
        }
      });
      fileHistory.appendChild(li);
    });
  }

  // Mudar linguagem
  document.getElementById('language-select').addEventListener('change', (e) => {
    const mode = e.target.value;
    editor.setOption('mode', mode === 'json' ? { name: 'javascript', json: true } : mode);
    announce(`Linguagem alterada para ${mode} no Tela Preta 2`);
    editor.focus();
  });

  // Novo arquivo
  document.getElementById('new-button').addEventListener('click', () => {
    editor.setValue('');
    localStorage.removeItem('code');
    announce('Novo arquivo criado no Tela Preta 2');
    editor.focus();
  });

  // Salvar arquivo
  document.getElementById('save-button').addEventListener('click', () => {
    const code = editor.getValue();
    const timestamp = Date.now();
    localStorage.setItem(`code_${timestamp}`, code);
    localStorage.setItem('code', code);
    announce('Arquivo salvo com sucesso no Tela Preta 2');
    loadFileHistory();
    editor.focus();
  });

  // Exportar arquivo
  document.getElementById('export-button').addEventListener('click', () => {
    exportDialog.showModal();
    fileNameInput.focus();
    fileNameError.classList.add('hidden');
    announce('Diálogo de exportação aberto no Tela Preta 2. Digite o nome do arquivo.');
  });
  exportDialog.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fileName = fileNameInput.value.trim();
    if (!validateFileName(fileName)) {
      fileNameError.classList.remove('hidden');
      announce('Nome de arquivo inválido. Use apenas letras, números, hífens ou sublinhados.');
      fileNameInput.focus();
      return;
    }
    fileNameError.classList.add('hidden');
    const code = editor.getValue();
    const mode = editor.getOption('mode').name || editor.getOption('mode');
    const extension = mode === 'javascript' ? 'js' : 
                     mode === 'htmlmixed' ? 'html' : 
                     mode === 'css' ? 'css' : 
                     mode === 'python' ? 'py' : 
                     mode === 'markdown' ? 'md' : 'json';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'code'}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    exportDialog.close();
    fileNameInput.value = '';
    announce(`Arquivo exportado como ${fileName || 'code'}.${extension} no Tela Preta 2`);
    editor.focus();
  });
  document.getElementById('export-dialog').querySelector('button[aria-label="Cancelar exportação no Tela Preta 2"]').addEventListener('click', () => {
    exportDialog.close();
    fileNameInput.value = '';
    fileNameError.classList.add('hidden');
    announce('Exportação cancelada no Tela Preta 2');
    editor.focus();
  });

  // Autocompletar
  document.getElementById('autocomplete-button').addEventListener('click', () => {
    editor.execCommand('autocomplete');
    announce('Autocompletar ativado no Tela Preta 2');
  });

  // Alternar tema
  let isHighContrast = false;
  document.getElementById('theme-button').addEventListener('click', () => {
    isHighContrast = !isHighContrast;
    editor.setOption('theme', isHighContrast ? 'monokai' : 'solarized light');
    document.body.classList.toggle('high-contrast', isHighContrast);
    announce(isHighContrast ? 'Tema de alto contraste ativado no Tela Preta 2' : 'Tema padrão ativado no Tela Preta 2');
    editor.focus();
  });

  // Mostrar/esconder ajuda e carregar histórico
  document.getElementById('help-button').addEventListener('click', () => {
    helpSection.classList.remove('hidden');
    helpSection.setAttribute('aria-expanded', 'true');
    helpButton.setAttribute('aria-expanded', 'true');
    loadFileHistory();
    announce('Instruções de ajuda e histórico abertos no Tela Preta 2');
    document.getElementById('close-help-button').focus();
  });
  document.getElementById('close-help-button').addEventListener('click', () => {
    helpSection.classList.add('hidden');
    helpSection.setAttribute('aria-expanded', 'false');
    helpButton.setAttribute('aria-expanded', 'false');
    announce('Instruções de ajuda e histórico fechados no Tela Preta 2');
    helpButton.focus();
  });

  // Ouvir instruções
  document.getElementById('read-help-button').addEventListener('click', () => {
    const utterance = new SpeechSynthesisUtterance(
      'No Tela Preta 2, use os botões para criar, salvar, exportar, autocompletar ou mudar o tema. Deslize com o TalkBack para navegar. Use dois toques para editar o código, abrir o diálogo de exportação ou carregar arquivos salvos. Pressione o botão Ouvir para repetir estas instruções.'
    );
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
    announce('Instruções sendo lidas no Tela Preta 2');
  });

  // Função para anúncios acessíveis
  function announce(message) {
    liveRegion.textContent = message;
    setTimeout(() => (liveRegion.textContent = ''), 5000);
  }
});