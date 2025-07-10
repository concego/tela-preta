const appState = {

  currentProject: '',

  editor: null,

  historyMessages: [],

  projectsCache: new Set()

};

// Função para validar nomes de projetos e arquivos

function isValidName(name) {

  return /^[a-zA-Z0-9][a-zA-Z0-9\-_\.]*$/.test(name);

}

// Função para verificar limite de localStorage

function checkStorageLimit() {

  const total = JSON.stringify(localStorage).length;

  const maxSize = 5 * 1024 * 1024; // 5MB

  if (total > maxSize * 0.9) {

    showErrorModal('Aviso: O armazenamento está quase cheio. Considere excluir arquivos ou projetos.');

  }

}

// Função para mostrar modal de erro

function showErrorModal(message) {

  const errorMessage = document.getElementById('errorMessage');

  errorMessage.textContent = message;

  const errorModal = document.getElementById('errorModal');

  errorModal.style.display = 'block';

  errorModal.querySelector('button').focus();

}

// Função para fechar modal de erro

function closeErrorModal() {

  document.getElementById('errorModal').style.display = 'none';

}

// Função para inicializar o editor

function initEditor() {

  const editorElement = document.getElementById('editor');

  appState.editor = CodeMirror.fromTextArea(editorElement, {

    lineNumbers: true,

    theme: 'default',

    viewportMargin: Infinity

  });

}

// Função para adicionar mensagem ao console de debug e histórico

function addDebugMessage(message, type = 'info') {

  const debugMessages = document.getElementById('debugMessages');

  const li = document.createElement('li');

  li.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;

  li.className = type === 'error' ? 'log-message log-error' : 'log-message';

  debugMessages.appendChild(li);

  debugMessages.scrollTop = debugMessages.scrollHeight;

  // Adicionar ao histórico (limitar a 100 mensagens)

  appState.historyMessages.push(`[${new Date().toLocaleTimeString()}] ${message}`);

  if (appState.historyMessages.length > 100) {

    appState.historyMessages.shift();

  }

  updateHistory();

}

// Função para atualizar o histórico

function updateHistory() {

  const historyMessagesUl = document.getElementById('historyMessages');

  historyMessagesUl.innerHTML = '';

  appState.historyMessages.forEach(msg => {

    const li = document.createElement('li');

    li.textContent = msg;

    li.className = 'log-message';

    historyMessagesUl.appendChild(li);

  });

}

// Função para limpar console de debug

function clearDebugConsole() {

  document.getElementById('debugMessages').innerHTML = '';

  addDebugMessage('Console limpo.');

}

// Função para limpar histórico

function clearHistory() {

  appState.historyMessages = [];

  updateHistory();

  addDebugMessage('Histórico limpo.');

}

// Função para abrir e fechar modais

function openHistory() {

  const historyModal = document.getElementById('historyModal');

  historyModal.style.display = 'block';

  historyModal.querySelector('button').focus();

}

function closeHistory() {

  document.getElementById('historyModal').style.display = 'none';

}

function openHelp() {

  const helpModal = document.getElementById('helpModal');

  helpModal.style.display = 'block';

  helpModal.querySelector('button').focus();

}

function closeHelp() {

  document.getElementById('helpModal').style.display = 'none';

}

function openModal() {

  const saveModal = document.getElementById('saveModal');

  saveModal.style.display = 'block';

  document.getElementById('projectName').focus();

}

function closeModal() {

  document.getElementById('saveModal').style.display = 'none';

}

function openRenameModal() {

  if (!appState.currentProject) {

    showErrorModal('Selecione um projeto para renomear!');

    addDebugMessage('Erro: Nenhum projeto selecionado para renomeação.', 'error');

    return;

  }

  const renameModal = document.getElementById('renameModal');

  document.getElementById('newProjectName').value = '';

  renameModal.style.display = 'block';

  document.getElementById('newProjectName').focus();

}

function closeRenameModal() {

  document.getElementById('renameModal').style.display = 'none';

}

// Função para limpar campo de busca

function clearSearch() {

  document.getElementById('fileSearch').value = '';

  filterFiles();

}

// Função para atualizar a lista de projetos

function updateProjectList() {

  const projectList = document.getElementById('projectList');

  const currentProjectSelect = document.getElementById('currentProject');

  const clearProjectBtn = document.getElementById('clearProjectBtn');

  const renameProjectBtn = document.getElementById('renameProjectBtn');

  // Atualizar cache

  appState.projectsCache.clear();

  Object.keys(localStorage).filter(key => !key.startsWith('__') && key !== 'current').forEach(key => {

    appState.projectsCache.add(key.split('/')[0]);

  });

  projectList.innerHTML = '';

  appState.projectsCache.forEach(project => {

    const option = document.createElement('option');

    option.value = project;

    projectList.appendChild(option);

  });

  currentProjectSelect.innerHTML = '<option value="">Selecione um projeto</option>';

  appState.projectsCache.forEach(project => {

    const option = document.createElement('option');

    option.value = project;

    option.textContent = project;

    if (project === appState.currentProject) option.selected = true;

    currentProjectSelect.appendChild(option);

  });

  clearProjectBtn.disabled = !appState.currentProject;

  renameProject Btn.disabled = !appState.currentProject;

}

// Função para salvar arquivo

function saveFile() {

  const projectName = document.getElementById('projectName').value.trim();

  const filePath = document.getElementById('filePath').value.trim();

  const fileName = document.getElementById('fileName').value.trim();

  const editorContent = appState.editor.getValue();

  if (!projectName) {

    showErrorModal('Nome do projeto é obrigatório!');

    addDebugMessage('Erro: Nome do projeto é obrigatório.', 'error');

    return;

  }

  if (!fileName) {

    showErrorModal('Nome do arquivo é obrigatório!');

    addDebugMessage('Erro: Nome do arquivo é obrigatório.', 'error');

    return;

  }

  if (!isValidName(projectName)) {

    showErrorModal('Nome do projeto contém caracteres inválidos!');

    addDebugMessage('Erro: Nome do projeto contém caracteres inválidos.', 'error');

    return;

  }

  if (!isValidName(filePath + '/' + fileName)) {

    showErrorModal('Caminho ou nome do arquivo contém caracteres inválidos!');

    addDebugMessage('Erro: Caminho ou nome do arquivo contém caracteres inválidos.', 'error');

    return;

  }

  const storageKey = filePath ? `${projectName}/${filePath}/${fileName}` : `${projectName}/${fileName}`;

  localStorage.setItem(storageKey, JSON.stringify({ content: editorContent }));

  checkStorageLimit();

  addDebugMessage(`Arquivo salvo: ${storageKey}`);

  appState.currentProject = projectName;

  updateProjectList();

  updateFileList();

  closeModal();

}

// Função para renomear projeto

function renameProject() {

  const newProjectName = document.getElementById('newProjectName').value.trim();

  if (!newProjectName) {

    showErrorModal('Novo nome do projeto é obrigatório!');

    addDebugMessage('Erro: Novo nome do projeto é obrigatório.', 'error');

    return;

  }

  if (!isValidName(newProjectName)) {

    showErrorModal('Novo nome do projeto contém caracteres inválidos!');

    addDebugMessage('Erro: Novo nome do projeto contém caracteres inválidos.', 'error');

    return;

  }

  if (newProjectName === appState.currentProject) {

    showErrorModal('O novo nome deve ser diferente do atual!');

    addDebugMessage('Erro: Novo nome do projeto é igual ao atual.', 'error');

    return;

  }

  if (appState.projectsCache.has(newProjectName)) {

    showErrorModal(`Já existe um projeto com esse nome!`);

    addDebugMessage(`Erro: Projeto "${newProjectName}" já existe.`, 'error');

    return;

  }

  Object.keys(localStorage)

    .filter(key => key.startsWith(appState.currentProject + '/') && key !== 'current')

    .forEach(key => {

      const data = JSON.parse(localStorage.getItem(key));

      const newKey = newProjectName + key.slice(appState.currentProject.length);

      localStorage.setItem(newKey, JSON.stringify(data));

      localStorage.removeItem(key);

    });

  addDebugMessage(`Projeto renomeado de "${appState.currentProject}" para "${newProjectName}"`);

  appState.currentProject = newProjectName;

  updateProjectList();

  updateFileList();

  closeRenameModal();

}

// Função para alternar projeto

function switchProject() {

  appState.currentProject = document.getElementById('currentProject').value;

  addDebugMessage(`Projeto alterado para "${appState.currentProject || 'Nenhum'}"`);

  updateProjectList();

  updateFileList();

}

// Função para limpar projeto atual

function clearCurrentProject() {

  if (!appState.currentProject) {

    showErrorModal('Nenhum projeto selecionado!');

    addDebugMessage('Erro: Nenhum projeto selecionado para limpeza.', 'error');

    return;

  }

  if (!confirm(`Tem certeza que deseja limpar todos os arquivos do projeto "${appState.currentProject}"? Esta ação não pode ser desfeita.`)) {

    return;

  }

  Object.keys(localStorage)

    .filter(key => key.startsWith(appState.currentProject + '/') && key !== 'current')

    .forEach(key => localStorage.removeItem(key));

  addDebugMessage(`Projeto "${appState.currentProject}" limpo.`);

  appState.currentProject = '';

  updateProjectList();

  updateFileList();

}

// Função para excluir arquivo individual

function deleteFile(key) {

  if (!confirm(`Tem certeza que deseja excluir o arquivo "${key.split('/').pop()}"? Esta ação não pode ser desfeita.`)) {

    return;

  }

  localStorage.removeItem(key);

  addDebugMessage(`Arquivo excluído: ${key}`);

  updateFileList();

}

// Debounce para filterFiles

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

// Função para listar arquivos do projeto atual

function updateFileList(searchTerm = '') {

  const fileTree = document.getElementById('fileTree');

  const fileCount = document.getElementById('fileCount');

  fileTree.innerHTML = '';

  const files = Object.keys(localStorage)

    .filter(key => !key.startsWith('__') && key !== 'current' && (!appState.currentProject || key.startsWith(appState.currentProject + '/'))

      && (!searchTerm || key.toLowerCase().includes(searchTerm.toLowerCase())));

  // Atualizar contador de arquivos com atraso para acessibilidade

  setTimeout(() => {

    fileCount.textContent = `Arquivos: ${files.length}`;

  }, 100);

  const tree = {};

  files.forEach(key => {

    const parts = key.split('/').slice(appState.currentProject ? 1 : 0);

    let current = tree;

    parts.forEach((part, index) => {

      if (!current[part]) {

        current[part] = index === parts.length - 1 ? key : {};

      }

      current = current[part];

    });

  });

  function renderTree(obj, parentUl, path = '') {

    Object.keys(obj).sort().forEach(name => {

      const li = document.createElement('li');

      li.setAttribute('role', 'treeitem');

      const fullPath = path ? `${path}/${name}` : name;

      if (typeof obj[name] === 'string') {

        li.innerHTML = `

          <button type="button" onclick="loadFile('${obj[name]}')" aria-label="Carregar arquivo ${name}">${name}</button>

          <button type="button" class="delete-button" onclick="deleteFile('${obj[name]}')" aria-label="Excluir arquivo ${name}">Excluir</button>

        `;

      } else {

        li.innerHTML = `<span aria-label="Pasta ${name}">${name}</span>`;

        li.setAttribute('aria-expanded', 'false');

        li.addEventListener('click', () => toggleFolder(li));

        const ul = document.createElement('ul');

        ul.setAttribute('role', 'group');

        renderTree(obj[name], ul, fullPath);

        li.appendChild(ul);

      }

      parentUl.appendChild(li);

    });

  }

  const rootUl = document.createElement('ul');

  rootUl.setAttribute('role', 'group');

  renderTree(tree, rootUl);

  fileTree.appendChild(rootUl);

}

// Função para filtrar arquivos com debounce

const filterFiles = debounce(() => {

  const searchTerm = document.getElementById('fileSearch').value;

  updateFileList(searchTerm);

}, 300);

// Função para carregar arquivo

function loadFile(key) {

  try {

    const data = JSON.parse(localStorage.getItem(key));

    appState.editor.setValue(data.content || '');

    addDebugMessage(`Arquivo carregado: ${key}`);

  } catch (e) {

    addDebugMessage(`Erro ao carregar arquivo ${key}: ${e.message}`, 'error');

  }

}

// Função para alternar visibilidade de pastas

function toggleFolder(li) {

  const isExpanded = li.getAttribute('aria-expanded') === 'true';

  li.setAttribute('aria-expanded', !isExpanded);

  const ul = li.querySelector('ul');

  if (ul) ul.style.display = isExpanded ? 'none' : 'block';

}

// Função para pré-visualizar o projeto atual

function previewProject() {

  if (!appState.currentProject) {

    showErrorModal('Selecione um projeto para pré-visualizar!');

    addDebugMessage('Erro: Nenhum projeto selecionado para pré-visualização.', 'error');

    return;

  }

  const previewFrame = document.getElementById('previewFrame');

  const previewSection = document.getElementById('previewSection');

  let htmlContent = '';

  let cssContent = '';

  let jsContent = '';

  let markdownContent = '';

  let jsonContent = '';

  // Coletar todos os arquivos do projeto atual

  const files = Object.keys(localStorage)

    .filter(key => key.startsWith(appState.currentProject + '/') && key !== 'current');

  files.forEach(key => {

    try {

      const data = JSON.parse(localStorage.getItem(key));

      if (!data.content) {

        addDebugMessage(`Aviso: Arquivo ${key} está vazio.`, 'error');

        return;

      }

      const fileName = key.split('/').pop().toLowerCase();

      if (fileName.endsWith('.html')) {

        htmlContent += data.content;

      } else if (fileName.endsWith('.css')) {

        cssContent += data.content;

      } else if (fileName.endsWith('.js')) {

        jsContent += data.content;

      } else if (fileName.endsWith('.md')) {

        markdownContent += marked.parse(data.content);

      } else if (fileName.endsWith('.json')) {

        try {

          const parsedJson = JSON.parse(data.content);

          jsonContent += `<pre>${JSON.stringify(parsedJson, null, 2)}</pre>`;

        } catch (e) {

          addDebugMessage(`Erro ao formatar JSON em ${key}: ${e.message}`, 'error');

        }

      }

    } catch (e) {

      addDebugMessage(`Erro ao processar arquivo ${key}: ${e.message}`, 'error');

    }

  });

  // Construir conteúdo da pré-visualização

  const previewContent = `

    <!DOCTYPE html>

    <html>

    <head>

      <style>

        ${cssContent}

        pre { font-family: monospace; background: #f5f5f5; padding: 10px; border: 1px solid #ccc; }

      </style>

    </head>

    <body>

      ${htmlContent}

      ${markdownContent}

      ${jsonContent}

      <script>

        window.onerror = function(msg, url, lineNo, columnNo, error) {

          window.parent.postMessage({

            type: 'debug',

            message: 'Erro JavaScript: ' + msg + ' (Linha: ' + lineNo + ', Coluna: ' + columnNo + ')'

          }, '*');

          return false;

        };

        try {

          ${jsContent}

        } catch (e) {

          window.parent.postMessage({

            type: 'debug',

            message: 'Erro ao executar JavaScript: ' + e.message

          }, '*');

        }

      </script>

    </body>

    </html>

  `;

  // Exibir pré-visualização

  try {

    previewFrame.srcdoc = previewContent;

    previewSection.style.display = 'block';

    addDebugMessage(`Pré-visualização do projeto "${appState.currentProject}" iniciada.`);

  } catch (e) {

    showErrorModal('Erro ao gerar pré-visualização: ' + e.message);

    addDebugMessage(`Erro na pré-visualização: ${e.message}`, 'error');

  }

}

// Capturar mensagens de erro do iframe

window.addEventListener('message', event => {

  if (event.origin !== window.location.origin) return;

  if (event.data.type === 'debug') {

    addDebugMessage(event.data.message, 'error');

  }

});

// Função para fechar pré-visualização

function closePreview() {

  document.getElementById('previewSection').style.display = 'none';

  document.getElementById('previewFrame').srcdoc = '';

  addDebugMessage('Pré-visualização fechada.');

}

// Função para exportar projeto como ZIP

function exportProjectAsZip() {

  if (!appState.currentProject) {

    showErrorModal('Selecione um projeto para exportar!');

    addDebugMessage('Erro: Nenhum projeto selecionado para exportação.', 'error');

    return;

  }

  const JSZip = window.JSZip;

  const zip = new JSZip();

  const files = Object.keys(localStorage)

    .filter(key => key.startsWith(appState.currentProject + '/') && key !== 'current');

  files.forEach(key => {

    try {

      const data = JSON.parse(localStorage.getItem(key));

      const filePath = key.slice(appState.currentProject.length + 1);

      zip.file(filePath, data.content);

    } catch (e) {

      addDebugMessage(`Erro ao adicionar arquivo ${key} ao ZIP: ${e.message}`, 'error');

    }

  });

  zip.generateAsync({ type: 'blob' }).then(blob => {

    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);

    link.download = `${appState.currentProject}.zip`;

    link.click();

    URL.revokeObjectURL(link.href);

    addDebugMessage(`Projeto "${appState.currentProject}" exportado como ZIP.`);

  });

}

// Função para alterar tema

function setTheme(theme) {

  appState.editor.setOption('theme', theme);

  localStorage.setItem('theme', theme);

  addDebugMessage(`Tema alterado para "${theme}"`);

}

// Inicializar editor, projetos e arquivos

document.addEventListener('DOMContentLoaded', () => {

  initEditor();

  const savedTheme = localStorage.getItem('theme') || 'default';

  setTheme(savedTheme);

  document.getElementById('themeSelect').value = savedTheme;

  updateProjectList();

  updateFileList();

  addDebugMessage('Aplicação iniciada.');

});