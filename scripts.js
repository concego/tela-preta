document.addEventListener('DOMContentLoaded', () => {
  // Inicializar CodeMirror
  const editor = CodeMirror(document.getElementById('editor'), {
    mode: 'javascript',
    theme: 'solarized light',
    lineNumbers: true,
    tabSize: 2,
    ariaLabel: 'Editor de código do Tela Preta 2'
  });

  const liveRegion = document.getElementById('live-region');
  const helpSection = document.getElementById('help-section');
  const exportDialog = document.getElementById('export-dialog');
  const fileNameInput = document.getElementById('file-name');

  // Carregar código salvo
  const savedCode = localStorage.getItem('code');
  if (savedCode) editor.setValue(savedCode);

  // Mudar linguagem
  document.querySelector('select').addEventListener('change', (e) => {
    const mode = e.target.value;
    editor.setOption('mode', mode === 'json' ? { name: 'javascript', json: true } : mode);
    announce('Linguagem alterada para ' + mode + ' no Tela Preta 2');
  });

  // Novo arquivo
  document.querySelector('button[aria-label="Novo arquivo"]').addEventListener('click', () => {
    editor.setValue('');
    localStorage.removeItem('code');
    announce('Novo arquivo criado no Tela Preta 2');
  });

  // Salvar arquivo
  document.querySelector('button[aria-label="Salvar arquivo"]').addEventListener('click', () => {
    const code = editor.getValue();
    localStorage.setItem('code', code);
    announce('Arquivo salvo com sucesso no Tela Preta 2');
  });

  // Exportar arquivo
  document.querySelector('button[aria-label="Exportar arquivo"]').addEventListener('click', () => {
    exportDialog.showModal();
    fileNameInput.focus();
    announce('Diálogo de exportação aberto no Tela Preta 2. Digite o nome do arquivo.');
  });
  exportDialog.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fileName = fileNameInput.value.trim() || 'code';
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
    a.download = `${fileName}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    exportDialog.close();
    fileNameInput.value = '';
    announce(`Arquivo exportado como ${fileName}.${extension} no Tela Preta 2`);
  });

  // Alternar tema
  let isHighContrast = false;
  document.querySelector('button[aria-label="Alternar tema de alto contraste"]').addEventListener('click', () => {
    isHighContrast = !isHighContrast;
    editor.setOption('theme', isHighContrast ? 'monokai' : 'solarized light');
    document.body.classList.toggle('high-contrast', isHighContrast);
    announce(isHighContrast ? 'Tema de alto contraste ativado no Tela Preta 2' : 'Tema padrão ativado no Tela Preta 2');
  });

  // Mostrar/esconder ajuda
  document.querySelector('button[aria-label="Abrir ajuda"]').addEventListener('click', () => {
    helpSection.classList.remove('hidden');
    announce('Seção de ajuda aberta no Tela Preta 2');
  });
  document.querySelector('button[aria-label="Fechar ajuda"]').addEventListener('click', () => {
    helpSection.classList.add('hidden');
    announce('Seção de ajuda fechada no Tela Preta 2');
    document.querySelector('button[aria-label="Abrir ajuda"]').focus();
  });

  // Comandos de voz
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'pt-BR';
  document.querySelector('button[aria-label="Ativar comandos de voz"]').addEventListener('click', () => {
    recognition.start();
    announce('Comandos de voz ativados no Tela Preta 2. Diga "novo", "salvar", "exportar" ou "ajuda".');
  });
  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    if (command.includes('novo')) {
      editor.setValue('');
      localStorage.removeItem('code');
      announce('Novo arquivo criado por comando de voz no Tela Preta 2');
    } else if (command.includes('salvar')) {
      localStorage.setItem('code', editor.getValue());
      announce('Arquivo salvo por comando de voz no Tela Preta 2');
    } else if (command.includes('exportar')) {
      exportDialog.showModal();
      fileNameInput.focus();
      announce('Diálogo de exportação aberto por comando de voz no Tela Preta 2. Digite o nome do arquivo.');
    } else if (command.includes('ajuda')) {
      helpSection.classList.toggle('hidden');
      announce('Seção de ajuda ' + (helpSection.classList.contains('hidden') ? 'fechada' : 'aberta') + ' no Tela Preta 2');
    }
  };

  // Ouvir instruções
  document.querySelector('button[aria-label="Ouvir instruções"]').addEventListener('click', () => {
    const utterance = new SpeechSynthesisUtterance(
      'No Tela Preta 2, use os botões para criar, salvar, exportar ou mudar o tema. Comandos de voz: diga novo, salvar, exportar ou ajuda. Gestos: deslize com dois dedos para a direita para abrir ou fechar a ajuda, ou para a esquerda para exportar.'
    );
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  });

  // Gesto de deslizar com dois dedos
  let touchStartX;
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      touchStartX = e.touches[0].clientX;
    }
  });
  document.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 2) {
      const touchEndX = e.changedTouches[0].clientX;
      if (touchEndX - touchStartX > 100) { // Deslize para a direita
        helpSection.classList.toggle('hidden');
        announce('Seção de ajuda ' + (helpSection.classList.contains('hidden') ? 'fechada' : 'aberta') + ' no Tela Preta 2');
      } else if (touchStartX - touchEndX > 100) { // Deslize para a esquerda
        exportDialog.showModal();
        fileNameInput.focus();
        announce('Diálogo de exportação aberto por gesto no Tela Preta 2. Digite o nome do arquivo.');
      }
    }
  });

  // Função para anúncios acessíveis
  function announce(message) {
    liveRegion.textContent = message;
    setTimeout(() => (liveRegion.textContent = ''), 3000);
  }
});