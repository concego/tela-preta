document.addEventListener('DOMContentLoaded', () => {
    // --- Variáveis de Estado Globais ---
    let allProjectsData = {}; // Armazena todos os projetos e seus arquivos
    let currentProjectName = null; // Nome do projeto atualmente ativo
    let editor = null; // Instância global do CodeMirror para o editor ativo
    let liveReloadTimeout; // ID do timeout para o live reload
    let openTabs = {}; // Objeto para armazenar as abas abertas: { filePath: { content: "...", type: "...", editorInstance: null }, ... }
    let activeTabPath = null; // Caminho do arquivo da aba atualmente ativa

    // --- Referências aos Elementos do DOM ---
    const projectListElement = document.getElementById('project-list');
    const fileTreeElement = document.getElementById('file-tree');
    const currentProjectNameSpan = document.getElementById('current-project-name');
    const consoleOutputElement = document.getElementById('console-output');
    const previewIframe = document.querySelector('#preview-iframe iframe');

    // Botões do Projeto
    const newProjectButton = document.getElementById('new-project-button');
    const openProjectButton = document.getElementById('open-project-button');
    const renameProjectButton = document.getElementById('rename-project-button');
    const deleteProjectButton = document.getElementById('delete-project-button');

    // Botões do Arquivo
    const newFileButton = document.getElementById('new-file-button');
    const renameFileButton = document.getElementById('rename-file-button');
    const deleteFileButton = document.getElementById('delete-file-button');

    // Botões de Ferramentas
    const runCodeButton = document.getElementById('run-code-button');
    const exportProjectButton = document.getElementById('export-project-button');

    // Abas de Saída
    const previewTabButton = document.getElementById('preview-tab');
    const consoleTabButton = document.getElementById('console-tab');

    // Elementos do Editor e Abas
    const editorTabsContainer = document.getElementById('editor-tabs'); // Contêiner para as abas
    const codeEditorTextarea = document.getElementById('code-editor'); // Textarea principal do CodeMirror

    // --- Funções Auxiliares ---

    /**
     * Limpa o console de saída.
     */
    function clearConsole() {
        consoleOutputElement.innerHTML = '';
        logToCustomConsole("Console limpo.", "info");
    }

    /**
     * Adiciona uma mensagem ao console de saída personalizado.
     * @param {string} message - A mensagem a ser exibida.
     * @param {string} type - O tipo da mensagem (log, info, warn, error, debug).
     */
    function logToCustomConsole(message, type = 'log') {
        const p = document.createElement('p');
        p.classList.add('console-message', `console-${type}`);
        p.textContent = `[${type.toUpperCase()}] ${message}`;
        consoleOutputElement.appendChild(p);
        consoleOutputElement.scrollTop = consoleOutputElement.scrollHeight; // Rola para o final
    }

    /**
     * Inferir o tipo do arquivo (usado para ícones ou agrupamento, se implementado).
     * @param {string} filePath - Caminho do arquivo.
     * @returns {string} O tipo inferido (ex: 'html', 'css', 'javascript', 'folder').
     */
    function inferFileTypeFromPath(filePath) {
        if (filePath.endsWith('/')) return 'folder'; // Convenção para pastas

        const extension = filePath.split('.').pop().toLowerCase();
        switch (extension) {
            case 'html': return 'html';
            case 'htm': return 'html';
            case 'css': return 'css';
            case 'js': return 'javascript';
            case 'json': return 'json';
            case 'py': return 'python';
            case 'md': return 'markdown';
            case 'yaml': return 'yaml';
            case 'yml': return 'yaml';
            case 'sql': return 'sql';
            case 'xml': return 'xml';
            case 'cs': return 'csharp';
            case 'lua': return 'lua';
            case 'glsl': return 'glsl';
            case 'shader': return 'glsl';
            default: return 'text';
        }
    }

    /**
     * Salva todos os dados dos projetos no Local Storage.
     */
    function saveProjectsToLocalStorage() {
        try {
            localStorage.setItem('allProjectsData', JSON.stringify(allProjectsData));
            logToCustomConsole("Projetos salvos.", "info");
        } catch (e) {
            logToCustomConsole(`Erro ao salvar projetos: ${e.message}`, "error");
        }
    }

    /**
     * Carrega todos os dados dos projetos do Local Storage.
     */
    function loadProjectsFromLocalStorage() {
        try {
            const data = localStorage.getItem('allProjectsData');
            if (data) {
                allProjectsData = JSON.parse(data);
                logToCustomConsole("Projetos carregados.", "info");
            }
        } catch (e) {
            logToCustomConsole(`Erro ao carregar projetos: ${e.message}`, "error");
            allProjectsData = {}; // Reseta os dados para evitar erros futuros
        }
    }

    /**
     * Define o modo do CodeMirror e as opções de hint (autocompletar) com base na extensão do arquivo.
     * @param {string} extension - A extensão do arquivo (ex: 'html', 'css', 'js', 'json', 'py', 'md', etc.).
     */
    function setEditorModeByExtension(extension) {
        let mode;
        let hint; // Variável para armazenar o hint a ser usado

        switch (extension) {
            case 'html':
            case 'htm':
                mode = 'htmlmixed';
                hint = CodeMirror.hint.html;
                break;
            case 'css':
                mode = 'css';
                hint = CodeMirror.hint.css;
                break;
            case 'js':
                mode = 'javascript';
                hint = CodeMirror.hint.javascript;
                break;
            case 'json':
                mode = 'application/json';
                hint = null;
                break;
            case 'md':
            case 'markdown':
                mode = 'markdown';
                hint = null;
                break;
            case 'py':
                mode = 'python';
                hint = null;
                break;
            case 'php':
                mode = 'php';
                hint = null;
                break;
            case 'yaml':
            case 'yml':
                mode = 'yaml';
                hint = null;
                break;
            case 'sql':
                mode = 'sql';
                hint = null;
                break;
            case 'xml':
                mode = 'xml';
                hint = CodeMirror.hint.xml;
                break;
            case 'cs': // C#
                mode = 'text/x-csharp';
                hint = null;
                break;
            case 'gd': // GDScript (sem modo específico no CM, usa plain text)
                mode = 'text/plain';
                hint = null;
                break;
            case 'lua': // Lua
                mode = 'lua';
                hint = null;
                break;
            case 'glsl': // GLSL (Shaders)
            case 'shader':
                mode = 'text/x-glsl';
                hint = null;
                break;
            default:
                mode = 'text/plain';
                hint = null;
        }

        if (editor) { // Garante que o editor existe antes de tentar definir o modo
             editor.setOption('mode', mode);
             editor.setOption('hintOptions', { hint: hint });
        }
        return mode; // Retorna o modo para uso na criação da instância
    }


    /**
     * Cria e retorna uma nova instância do CodeMirror anexada a um elemento.
     * Esta função agora também gerencia o listener de `change` para o live reload.
     * @param {HTMLElement} element - O elemento HTML (textarea ou div) para anexar o editor.
     * @param {string} mode - O modo CodeMirror inicial.
     * @returns {CodeMirror.Editor} A instância do CodeMirror.
     */
    function createEditorInstanceForTab(element, mode) {
        const newEditor = CodeMirror.fromTextArea(element, {
            mode: mode,
            lineNumbers: true,
            theme: 'dracula',
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false,
            autofocus: true,
            lineWrapping: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Cmd-Space": "autocomplete",
                "Tab": function(cm) { // Permite autocompletar com Tab também
                    if (cm.somethingSelected()) {
                        cm.indentSelection("add");
                    } else {
                        cm.replaceSelection(cm.getOption("indentWithTabs") ? "\t" :
                            Array(cm.getOption("indentUnit") + 1).join(" "), "end");
                    }
                },
                "Ctrl-F": "findPersistent", // Abre a barra de busca persistente
                "Cmd-F": "findPersistent", // Para usuários de Mac
                "Ctrl-G": "findNext",      // Próxima ocorrência
                "Cmd-G": "findNext",       // Próxima ocorrência (Mac)
                "Shift-Ctrl-G": "findPrev", // Ocorrência anterior
                "Shift-Cmd-G": "findPrev",  // Ocorrência anterior (Mac)
                "Ctrl-H": "replace",       // Abre a caixa de substituição
                "Cmd-H": "replace",        // Abre a caixa de substituição (Mac)
                "Shift-Ctrl-H": "replaceAll", // Substituir todas as ocorrências
                "Shift-Cmd-H": "replaceAll",  // Substituir todas as ocorrências (Mac)
            },
            hintOptions: {
                completeSingle: false
            }
        });

        // Adiciona o listener de mudança para o live reload e salvamento
        newEditor.on('change', () => {
            // Salva o conteúdo do editor ativo na sua aba correspondente
            if (activeTabPath && openTabs[activeTabPath]) {
                openTabs[activeTabPath].content = newEditor.getValue();
                saveProjectsToLocalStorage(); // Salva automaticamente ao digitar
            }

            clearTimeout(liveReloadTimeout);
            liveReloadTimeout = setTimeout(() => {
                // Executa runCode() apenas se a aba de preview estiver ativa
                // ou se o console não estiver ativo (preview é o padrão)
                if (previewTabButton.classList.contains('active') || !consoleTabButton.classList.contains('active')) {
                     runCode();
                } else {
                     logToCustomConsole("Código atualizado. Clique em 'Executar Código' ou mude para a aba 'Preview' para ver as mudanças.", "info");
                }
            }, 700); // Atraso de 700 milissegundos
        });

        return newEditor;
    }


    // --- Gerenciamento de Projetos ---

    /**
     * Renderiza a lista de projetos na sidebar.
     */
    function renderProjectList() {
        projectListElement.innerHTML = '';
        if (Object.keys(allProjectsData).length === 0) {
            projectListElement.innerHTML = '<li>Nenhum projeto.</li>';
            return;
        }
        Object.keys(allProjectsData).forEach(projectName => {
            const li = document.createElement('li');
            li.textContent = projectName;
            if (projectName === currentProjectName) {
                li.classList.add('active');
            }
            li.addEventListener('click', () => openProject(projectName));
            projectListElement.appendChild(li);
        });
    }

    /**
     * Abre um projeto existente.
     * @param {string} projectName - O nome do projeto a ser aberto.
     */
    function openProject(projectName) {
        if (!allProjectsData[projectName]) {
            alert("Projeto não encontrado.");
            return;
        }

        // Salva o conteúdo do editor atual na aba ativa antes de trocar de projeto
        if (activeTabPath && openTabs[activeTabPath] && editor) {
            openTabs[activeTabPath].content = editor.getValue();
        }

        // Limpa todas as abas abertas ao trocar de projeto
        openTabs = {};
        activeTabPath = null;
        if (editor) {
            editor.toTextArea(); // Desanexa o CodeMirror do textarea
            editor = null; // Limpa a referência global do editor
        }
        codeEditorTextarea.value = ''; // Limpa o textarea subjacente


        currentProjectName = projectName;
        const project = allProjectsData[currentProjectName];
        localStorage.setItem('lastActiveProject', currentProjectName);

        renderProjectList(); // Atualiza o destaque do projeto ativo
        renderFileTree(); // Renderiza a árvore de arquivos do novo projeto
        currentProjectNameSpan.textContent = projectName;

        // Abre o último arquivo ativo do projeto, se houver e existir
        if (project.activeFile && project.files[project.activeFile]) {
            openFileInProject(project.activeFile);
        } else {
            // Se não houver arquivo ativo, ou o arquivo não existe mais,
            // ou se o editor ainda não foi criado (primeiro projeto aberto)
            if (!editor) { // Se o editor global ainda não foi criado
                editor = createEditorInstanceForTab(codeEditorTextarea, 'htmlmixed'); // Cria uma instância padrão
            } else { // Se já existe, apenas limpa
                editor.setValue('');
            }
            renderEditorTabs(); // Renderiza as abas (vazio ou com a inicial)
        }
        logToCustomConsole(`Projeto "${projectName}" aberto.`, "info");
    }


    /**
     * Cria um novo projeto.
     */
    function createNewProject() {
        let projectName = prompt("Digite o nome do novo projeto:");
        if (projectName) {
            projectName = projectName.trim();
            if (projectName in allProjectsData) {
                alert("Já existe um projeto com este nome.");
                return;
            }
            allProjectsData[projectName] = {
                files: {
                    'index.html': {
                        content: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Olá, ${projectName}!</h1>
    <script src="script.js"></script>
</body>
</html>`,
                        type: 'html'
                    },
                    'style.css': {
                        content: `body {
    font-family: sans-serif;
    background-color: #282c34;
    color: #abb2bf;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
}

h1 {
    color: #61afef;
}`,
                        type: 'css'
                    },
                    'script.js': {
                        content: `console.log("Bem-vindo ao ${projectName}!");`,
                        type: 'javascript'
                    }
                },
                activeFile: 'index.html' // Define um arquivo ativo padrão
            };
            saveProjectsToLocalStorage();
            openProject(projectName);
            alert(`Projeto "${projectName}" criado com sucesso!`);
        }
    }

    /**
     * Renomeia o projeto atualmente ativo.
     */
    function renameCurrentProject() {
        if (!currentProjectName) {
            alert("Nenhum projeto selecionado para renomear.");
            return;
        }
        let newName = prompt(`Renomear "${currentProjectName}" para:`, currentProjectName);
        if (newName) {
            newName = newName.trim();
            if (newName === currentProjectName) return; // Nenhuma mudança
            if (newName in allProjectsData) {
                alert("Já existe um projeto com este nome.");
                return;
            }

            allProjectsData[newName] = allProjectsData[currentProjectName];
            delete allProjectsData[currentProjectName];
            currentProjectName = newName;
            localStorage.setItem('lastActiveProject', currentProjectName); // Atualiza o último ativo
            saveProjectsToLocalStorage();
            renderProjectList();
            currentProjectNameSpan.textContent = newName; // Atualiza nome exibido
            alert(`Projeto renomeado para "${newName}".`);
        }
    }

    /**
     * Exclui o projeto atualmente ativo.
     */
    function deleteCurrentProject() {
        if (!currentProjectName) {
            alert("Nenhum projeto selecionado para excluir.");
            return;
        }
        if (confirm(`Tem certeza que deseja excluir o projeto "${currentProjectName}" e todo o seu conteúdo? Esta ação é irreversível!`)) {
            delete allProjectsData[currentProjectName];
            saveProjectsToLocalStorage();

            // Limpa o editor e as abas
            if (editor) {
                editor.toTextArea();
                editor = null;
            }
            openTabs = {};
            activeTabPath = null;
            codeEditorTextarea.value = '';
            renderEditorTabs();

            currentProjectName = null;
            localStorage.removeItem('lastActiveProject'); // Remove a referência
            renderProjectList();
            renderFileTree();
            currentProjectNameSpan.textContent = 'Nenhum';
            alert("Projeto excluído com sucesso!");
        }
    }

    // --- Gerenciamento de Arquivos ---

    /**
     * Renderiza a árvore de arquivos para o projeto atual.
     * Suporta estrutura de pastas (simulada por caminhos).
     */
    function renderFileTree() {
        fileTreeElement.innerHTML = '';
        if (!currentProjectName || !allProjectsData[currentProjectName]) {
            fileTreeElement.innerHTML = '<li>Selecione um projeto.</li>';
            return;
        }

        const project = allProjectsData[currentProjectName];
        const files = Object.keys(project.files).sort((a, b) => {
            const aIsDir = a.endsWith('/');
            const bIsDir = b.endsWith('/');
            if (aIsDir && !bIsDir) return -1;
            if (!aIsDir && bIsDir) return 1;
            return a.localeCompare(b);
        });

        const buildTree = (paths) => {
            const tree = {};
            paths.forEach(path => {
                const parts = path.split('/').filter(p => p !== '');
                let current = tree;
                parts.forEach((part, index) => {
                    if (index === parts.length - 1 && !path.endsWith('/')) { // É um arquivo
                        current[part] = path; // Armazena o caminho completo
                    } else { // É uma pasta
                        if (!current[part]) {
                            current[part] = {};
                        }
                        current = current[part];
                    }
                });
            });
            return tree;
        };

        const appendTree = (parentEl, node, currentPath = '') => {
            Object.keys(node).forEach(name => {
                const fullPath = currentPath ? `${currentPath}/${name}` : name;
                const li = document.createElement('li');

                if (typeof node[name] === 'object') { // É uma pasta
                    li.classList.add('folder');
                    const toggle = document.createElement('span');
                    toggle.classList.add('folder-toggle', 'expanded'); // Começa expandido
                    toggle.textContent = '▼ '; // Símbolo de expandido
                    toggle.addEventListener('click', (e) => {
                        e.stopPropagation();
                        li.classList.toggle('collapsed');
                        toggle.classList.toggle('expanded');
                        toggle.classList.toggle('collapsed');
                    });
                    li.appendChild(toggle);

                    const folderNameSpan = document.createElement('span');
                    folderNameSpan.textContent = name;
                    li.appendChild(folderNameSpan);
                    
                    const ul = document.createElement('ul');
                    li.appendChild(ul);
                    appendTree(ul, node[name], fullPath);
                } else { // É um arquivo
                    li.textContent = name;
                    li.dataset.filePath = node[name]; // Armazena o caminho completo
                    li.addEventListener('click', () => openFileInProject(node[name]));
                    if (node[name] === project.activeFile) {
                        li.classList.add('active');
                    }
                }
                parentEl.appendChild(li);
            });
        };

        const fileTree = buildTree(files);
        appendTree(fileTreeElement, fileTree);
    }

    /**
     * Abre um arquivo no editor.
     * @param {string} filePath - O caminho do arquivo a ser aberto.
     */
    function openFileInProject(filePath) {
        if (!currentProjectName || !allProjectsData[currentProjectName]) {
            alert("Por favor, selecione ou crie um projeto primeiro.");
            return;
        }
        const project = allProjectsData[currentProjectName];

        if (!project.files[filePath]) {
            alert(`Arquivo "${filePath}" não encontrado no projeto "${currentProjectName}".`);
            return;
        }

        // Se o arquivo já está aberto em uma aba, apenas alterna para ele
        if (openTabs[filePath]) {
            switchTab(filePath);
            return;
        }

        // Se não está aberto, adiciona à lista de abas abertas
        const fileContent = project.files[filePath].content;
        const fileExtension = filePath.split('.').pop().toLowerCase();

        openTabs[filePath] = {
            content: fileContent,
            type: inferFileTypeFromPath(filePath)
        };

        // Salva o arquivo ativo no projeto (para persistir qual arquivo estava aberto)
        project.activeFile = filePath;
        saveProjectsToLocalStorage();

        switchTab(filePath); // Ativa a nova aba
        renderFileTree(); // Atualiza a árvore de arquivos para destacar o arquivo ativo
    }


    /**
     * Cria um novo arquivo ou pasta no projeto ativo.
     */
    function createNewFileOrFolder() {
        if (!currentProjectName) {
            alert("Nenhum projeto aberto para criar arquivo/pasta.");
            return;
        }

        let newPath = prompt("Digite o nome do novo arquivo ou pasta (ex: arquivo.html, pasta/subpasta/):");
        if (!newPath) return;

        newPath = newPath.trim();
        const project = allProjectsData[currentProjectName];

        if (newPath.endsWith('/')) { // É uma pasta
            // Apenas cria uma entrada para a pasta, não terá conteúdo
            // A pasta será refletida na árvore de arquivos por ter um path
            // Não adicionamos conteúdo para pastas, mas o path precisa existir
            // para que a função renderFileTree crie o nó
            // No futuro, poderíamos ter um tipo 'folder' com um objeto vazio
            if (!project.files[newPath]) {
                project.files[newPath] = { content: '', type: 'folder' }; // Pode ser um objeto vazio {} para pastas
                saveProjectsToLocalStorage();
                renderFileTree();
                alert(`Pasta "${newPath}" criada.`);
            } else {
                alert("Pasta já existe.");
            }
        } else { // É um arquivo
            if (project.files[newPath]) {
                alert("Arquivo já existe.");
                return;
            }
            const fileExtension = newPath.split('.').pop().toLowerCase();
            project.files[newPath] = {
                content: '', // Conteúdo inicial vazio
                type: inferFileTypeFromPath(newPath)
            };
            saveProjectsToLocalStorage();
            renderFileTree();
            openFileInProject(newPath);
            alert(`Arquivo "${newPath}" criado.`);
        }
    }

    /**
     * Renomeia um arquivo ou pasta no projeto ativo.
     */
    function renameFileInProject() {
        if (!currentProjectName || !activeTabPath) {
            alert("Selecione um arquivo aberto na aba para renomear.");
            return;
        }

        const project = allProjectsData[currentProjectName];
        const oldPath = activeTabPath;

        let newPath = prompt(`Renomear "${oldPath}" para:`, oldPath);
        if (!newPath) return;

        newPath = newPath.trim();
        if (newPath === oldPath) return; // Sem alteração

        if (project.files[newPath]) {
            alert("Já existe um arquivo ou pasta com este nome no projeto.");
            return;
        }

        // Lógica para renomear pasta e seus conteúdos aninhados
        const isOldPathFolder = oldPath.endsWith('/');
        const isNewPathFolder = newPath.endsWith('/');

        if (isOldPathFolder !== isNewPathFolder) {
            alert("Não é possível mudar o tipo de item (arquivo para pasta ou vice-versa) ao renomear. Crie um novo e exclua o antigo.");
            return;
        }

        const filesToMove = {};
        Object.keys(project.files).forEach(filePath => {
            if (filePath.startsWith(oldPath)) {
                const newFilePath = newPath + filePath.substring(oldPath.length);
                filesToMove[newFilePath] = project.files[filePath];
            }
        });

        // Primeiro adiciona os novos caminhos
        Object.assign(project.files, filesToMove);

        // Depois remove os antigos
        Object.keys(project.files).forEach(filePath => {
            if (filePath.startsWith(oldPath)) {
                delete project.files[filePath];
            }
        });


        // Atualiza a aba se o arquivo renomeado estava aberto
        if (openTabs[oldPath]) {
            openTabs[newPath] = openTabs[oldPath]; // Copia a referência da aba
            delete openTabs[oldPath]; // Remove a entrada antiga
        }
        // Atualiza o activeTabPath se o arquivo ativo foi renomeado
        if (activeTabPath === oldPath) {
            activeTabPath = newPath;
        }
        // Atualiza o activeFile do projeto
        if (project.activeFile === oldPath) {
            project.activeFile = newPath;
        }
        
        saveProjectsToLocalStorage();
        renderFileTree();
        renderEditorTabs(); // Re-renderiza as abas para atualizar os nomes
        // Re-abre o arquivo se era o ativo para garantir que o editor esteja ligado à nova aba
        if (activeTabPath === newPath) {
             switchTab(newPath);
        }
        alert(`"${oldPath}" renomeado para "${newPath}".`);
    }


    /**
     * Exclui um arquivo ou pasta no projeto ativo.
     */
    function deleteFileInProject() {
        if (!currentProjectName || (!activeTabPath && !fileTreeElement.querySelector('li.active'))) {
            alert("Selecione um arquivo ou pasta na árvore para excluir.");
            return;
        }
        const project = allProjectsData[currentProjectName];

        let filePathToDelete = activeTabPath; // Pega da aba ativa por padrão

        // Se nenhuma aba ativa, tenta pegar da seleção na árvore (útil para pastas)
        if (!filePathToDelete) {
            const selectedFileElement = fileTreeElement.querySelector('li.active[data-file-path]');
            if (selectedFileElement) {
                filePathToDelete = selectedFileElement.dataset.filePath;
            } else {
                 const selectedFolderElement = fileTreeElement.querySelector('li.folder.active > span');
                 if (selectedFolderElement) {
                     // Isso é um pouco mais complexo, pois precisamos reconstruir o caminho completo da pasta
                     // Por simplicidade, vamos exigir uma aba ativa para arquivos e um prompt para pastas
                     alert("Por favor, abra o arquivo que deseja excluir na aba, ou use a opção 'Renomear/Excluir' se for uma pasta.");
                     return;
                 }
            }
        }

        if (!filePathToDelete || !project.files[filePathToDelete] && !Object.keys(project.files).some(p => p.startsWith(filePathToDelete + '/'))) {
            alert("Arquivo ou pasta não encontrado(a) para exclusão.");
            return;
        }

        if (confirm(`Tem certeza que deseja excluir "${filePathToDelete}"?`)) {
            // Se for uma pasta, exclui todos os arquivos dentro dela
            if (filePathToDelete.endsWith('/')) {
                Object.keys(project.files).forEach(file => {
                    if (file.startsWith(filePathToDelete)) {
                        delete project.files[file];
                        if (openTabs[file]) {
                            closeTab(file); // Fecha a aba se o arquivo estava aberto
                        }
                    }
                });
            } else {
                delete project.files[filePathToDelete];
                // Se o arquivo excluído estava aberto em uma aba, feche-a
                if (openTabs[filePathToDelete]) {
                    closeTab(filePathToDelete); // Usa a função closeTab para lidar com a lógica de fechamento
                }
            }
            saveProjectsToLocalStorage();
            renderFileTree();
            alert(`"${filePathToDelete}" excluído com sucesso.`);
        }
    }


    // --- Funções de Abas do Editor ---

    /**
     * Renderiza as abas de arquivo abertas na UI.
     */
    function renderEditorTabs() {
        editorTabsContainer.innerHTML = ''; // Limpa as abas existentes

        if (Object.keys(openTabs).length === 0) {
            // Se não houver abas abertas, esconde o editor e mostra uma mensagem
            codeEditorTextarea.style.display = 'none'; // Esconde o textarea do CodeMirror
            editorTabsContainer.innerHTML = '<div style="padding: 10px; color: #aaa;">Nenhum arquivo aberto. Clique em um arquivo na barra lateral.</div>';
            return;
        } else {
            codeEditorTextarea.style.display = 'block'; // Garante que o textarea esteja visível
        }


        Object.keys(openTabs).forEach(filePath => {
            const tabElement = document.createElement('div');
            tabElement.classList.add('editor-tab');
            if (filePath === activeTabPath) {
                tabElement.classList.add('active');
            }

            const fileName = filePath.split('/').pop() || (filePath.endsWith('/') ? filePath.slice(0, -1).split('/').pop() + '/' : filePath); // Pega apenas o nome do arquivo/pasta
            tabElement.innerHTML = `<span>${fileName}</span><button class="close-tab-button">&times;</button>`;
            tabElement.dataset.filePath = filePath; // Armazena o caminho completo

            // Event listener para alternar abas
            tabElement.querySelector('span').addEventListener('click', () => {
                if (filePath !== activeTabPath) {
                    switchTab(filePath);
                }
            });

            // Event listener para fechar aba
            tabElement.querySelector('.close-tab-button').addEventListener('click', (e) => {
                e.stopPropagation(); // Impede que o clique na aba seja acionado
                closeTab(filePath);
            });

            editorTabsContainer.appendChild(tabElement);
        });
    }

    /**
     * Alterna para uma aba de arquivo específica.
     * @param {string} filePath - O caminho do arquivo da aba a ser ativada.
     */
    function switchTab(filePath) {
        if (!openTabs[filePath]) {
            logToCustomConsole("Tentativa de alternar para aba não existente: " + filePath, "error");
            return;
        }

        // 1. Salva o conteúdo do editor atual na sua aba anterior (se houver um ativo)
        if (activeTabPath && openTabs[activeTabPath] && editor) {
            openTabs[activeTabPath].content = editor.getValue();
            // Também podemos salvar o estado do cursor e scroll se quisermos persistir
            // openTabs[activeTabPath].cursor = editor.getCursor();
            // openTabs[activeTabPath].scroll = editor.getScrollInfo();
        }

        // 2. Desanexa a instância do CodeMirror anterior
        if (editor) {
            editor.toTextArea(); // "Desanexa" o CodeMirror do textarea
        }

        activeTabPath = filePath; // Define a nova aba ativa

        // 3. Anexa o CodeMirror ao textarea principal e carrega o conteúdo
        const fileContent = openTabs[filePath].content;
        const fileExtension = filePath.split('.').pop().toLowerCase();
        
        // Re-cria/re-anexa a instância do editor principal global 'editor'
        // Passa o elemento textarea principal para o CodeMirror usar
        editor = createEditorInstanceForTab(codeEditorTextarea, setEditorModeByExtension(fileExtension));
        
        editor.setValue(fileContent);
        // setEditorModeByExtension(fileExtension); // Já é chamado dentro de createEditorInstanceForTab
        
        // Opcional: Restaurar cursor e scroll (descomentar se implementado acima)
        // if (openTabs[filePath].cursor) editor.setCursor(openTabs[filePath].cursor);
        // if (openTabs[filePath].scroll) editor.scrollTo(openTabs[filePath].scroll.left, openTabs[filePath].scroll.top);
        
        editor.focus(); // Coloca o foco no editor

        // Atualiza a lista de arquivos para refletir o arquivo ativo
        if (currentProjectName && allProjectsData[currentProjectName]) {
             allProjectsData[currentProjectName].activeFile = filePath;
             saveProjectsToLocalStorage();
             renderFileTree();
        }
       
        renderEditorTabs(); // Re-renderiza as abas para atualizar o estado ativo
    }

    /**
     * Fecha uma aba de arquivo.
     * @param {string} filePath - O caminho do arquivo da aba a ser fechada.
     */
    function closeTab(filePath) {
        if (!openTabs[filePath]) return;

        // Salva o conteúdo da aba antes de fechar
        if (openTabs[filePath].editorInstance || (filePath === activeTabPath && editor)) {
            openTabs[filePath].content = editor.getValue(); // Se for a ativa, pega do editor
        }
        
        delete openTabs[filePath]; // Remove a aba do registro

        // Se a aba a ser fechada é a ativa
        if (filePath === activeTabPath) {
            // Remove a instância do CodeMirror do textarea
            if (editor) {
                editor.toTextArea(); // Desanexa o CodeMirror
                editor = null; // Limpa a referência global
            }

            const remainingPaths = Object.keys(openTabs);
            if (remainingPaths.length > 0) {
                // Abre a próxima aba disponível (a primeira na lista)
                switchTab(remainingPaths[0]);
            } else {
                // Não há mais abas, limpa o editor e redefine o estado
                activeTabPath = null;
                codeEditorTextarea.value = ''; // Limpa o textarea subjacente

                // Garante que o editor principal seja inicializado para o estado "nenhum arquivo aberto"
                if (!editor) {
                    editor = createEditorInstanceForTab(codeEditorTextarea, 'htmlmixed');
                }
                editor.setValue(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-2cale=1.0">
    <title>Bem-vindo ao Tela Preta!</title>
    <style>
        body {
            font-family: sans-serif;
            background-color: #333;
            color: #eee;
            margin: 20px;
        }
        h1 {
            color: #00ff00;
        }
    </style>
</head>
<body>
    <h1>Crie seu primeiro projeto!</h1>
    <p>Use o botão "Novo Projeto" na barra lateral para começar.</p>
    <script>
        console.log("Olá, Concego! Editor pronto.");
    </script>
</body>
</html>`); // Conteúdo padrão
            }
        } 
        // Se a aba fechada não era a ativa, não precisa fazer nada além de deletar de openTabs

        saveProjectsToLocalStorage(); // Salva as alterações
        renderEditorTabs(); // Re-renderiza as abas
        if (currentProjectName) {
            renderFileTree(); // Atualiza a árvore de arquivos para desmarcar o ativo se fechou
        }
    }


    // --- Gerenciamento de Saída (Preview e Console) ---

    /**
     * Exibe o painel de saída especificado (preview ou console).
     * @param {string} panelId - O ID do painel a ser exibido ('preview-iframe' ou 'console-output').
     */
    function showOutputPanel(panelId) {
        document.querySelectorAll('.output-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(panelId).classList.add('active');

        // Atualiza o estado ativo dos botões de aba de saída
        previewTabButton.classList.remove('active');
        consoleTabButton.classList.remove('active');
        if (panelId === 'preview-iframe') {
            previewTabButton.classList.add('active');
        } else {
            consoleTabButton.classList.add('active');
        }
    }

    /**
     * Executa o código HTML, CSS e JavaScript do projeto ativo dentro de um iframe e redireciona os logs.
     * Combina todos os arquivos HTML, CSS e JS do projeto.
     */
    function runCode() {
        if (!currentProjectName || !allProjectsData[currentProjectName]) {
            logToCustomConsole("Nenhum projeto aberto para executar código.", "warn");
            return;
        }

        clearConsole(); // Limpa o console a cada execução
        logToCustomConsole("Executando projeto...", "info");

        const project = allProjectsData[currentProjectName];
        const files = project.files || {};

        let htmlContent = '';
        let cssContent = [];
        let jsContent = [];

        // 1. Identificar e Separar Conteúdos
        // Prioriza index.html como HTML principal, mas aceita outros .html se não houver index.html
        let mainHtmlFile = 'index.html';
        if (!files[mainHtmlFile]) {
             // Busca o primeiro arquivo .html se 'index.html' não existir
            mainHtmlFile = Object.keys(files).find(filePath => filePath.endsWith('.html') || filePath.endsWith('.htm'));
        }
        if (mainHtmlFile && files[mainHtmlFile]) {
            htmlContent = files[mainHtmlFile].content;
        } else {
            logToCustomConsole("Aviso: Nenhum arquivo HTML principal (index.html ou outro .html) encontrado no projeto. O preview pode estar vazio.", "warn");
        }


        Object.keys(files).forEach(filePath => {
            const file = files[filePath];
            const extension = filePath.split('.').pop().toLowerCase();

            // Ignora o HTML principal se já o pegamos
            if (filePath === mainHtmlFile) return;

            if (extension === 'css') {
                cssContent.push(file.content);
            } else if (extension === 'js') {
                jsContent.push(file.content);
            }
            // Outros tipos de arquivo são ignorados para a execução no iframe, mas podem ser referenciados do HTML
        });

        // 2. Construir o HTML Final
        let finalHtml = htmlContent;
        const headEndTag = '</head>';
        const bodyEndTag = '</body>';

        // Injetar CSS combinado no <head> ou antes do </body>
        if (cssContent.length > 0) {
            const combinedCss = `<style>\n${cssContent.join('\n\n')}\n</style>`;
            if (finalHtml.includes(headEndTag)) {
                finalHtml = finalHtml.replace(headEndTag, `${combinedCss}\n${headEndTag}`);
            } else if (finalHtml.includes(bodyEndTag)) { // Fallback se não tiver <head>
                finalHtml = finalHtml.replace(bodyEndTag, `${combinedCss}\n${bodyEndTag}`);
            } else { // Último fallback: adiciona no final
                finalHtml += combinedCss;
            }
        }

        // Injetar JavaScript combinado antes de </body>
        if (jsContent.length > 0) {
            const combinedJs = `<script>\n${jsContent.join('\n\n')}\n</script>`;
            if (finalHtml.includes(bodyEndTag)) {
                finalHtml = finalHtml.replace(bodyEndTag, `${combinedJs}\n${bodyEndTag}`);
            } else { // Fallback: adiciona no final
                finalHtml += combinedJs;
            }
        }

        // --- Início da Lógica de Iframe e Console (Já existente, mas confirmando que está aqui) ---
        // Acessa o contentDocument do iframe com segurança
        let iframeDoc;
        try {
            iframeDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
        } catch (e) {
            logToCustomConsole("Erro ao acessar o documento do iframe: " + e.message + ". O iframe pode estar bloqueado por políticas de segurança.", "error");
            return;
        }


        // Limpa o conteúdo anterior do iframe
        iframeDoc.open();
        iframeDoc.write(''); // Escreve uma string vazia para limpar
        iframeDoc.close();

        // Redireciona console do iframe para o nosso console customizado ANTES de escrever o código
        // Isso precisa ser feito toda vez que o iframe é "resetado"
        const iframeWindow = previewIframe.contentWindow;
        const iframeConsole = iframeWindow.console;
        
        // Armazena os consoles originais para evitar recursão infinita se o código do usuário chamar console.log
        const originalConsoleMethods = {};
        ['log', 'warn', 'error', 'info', 'debug'].forEach(methodName => {
            originalConsoleMethods[methodName] = iframeConsole[methodName]; // Guarda o método original
            iframeConsole[methodName] = (...args) => {
                const message = args.map(arg => {
                    if (typeof arg === 'object' && arg !== null) {
                        try {
                            return JSON.stringify(arg, null, 2);
                        } catch (e) {
                            return String(arg);
                        }
                    }
                    return String(arg);
                }).join(' ');

                logToCustomConsole(message, methodName);
                // Opcional: Chamar o console original do iframe também, para debug no console do navegador
                // originalConsoleMethods[methodName].apply(iframeConsole, args);
            };
        });

        // --- Captura de Erros JavaScript no Iframe ---
        // Limpa listeners anteriores para evitar duplicação em recargas
        iframeWindow.onerror = null;
        iframeWindow.removeEventListener('unhandledrejection', handleIframeUnhandledRejection);
        
        iframeWindow.onerror = (message, source, lineno, colno, error) => {
            const errorMessage = `ERRO (linha ${lineno}, col ${colno}): ${message}`;
            logToCustomConsole(errorMessage, 'error');
            // Retorna true para evitar que o erro apareça no console principal do navegador também
            return true; 
        };

        // Função nomeada para poder ser removida com removeEventListener
        function handleIframeUnhandledRejection(event) {
            const errorMessage = `ERRO (Promise não tratada): ${event.reason}`;
            logToCustomConsole(errorMessage, 'error');
        }
        iframeWindow.addEventListener('unhandledrejection', handleIframeUnhandledRejection);


        // 3. Injetar o Conteúdo Combinado no Iframe
        iframeDoc.open();
        iframeDoc.write(finalHtml);
        iframeDoc.close();

        logToCustomConsole("Execução concluída. Verifique a aba 'Preview' para o resultado e 'Console' para logs.", "info");
        showOutputPanel('preview-iframe'); // Altera para a aba Preview automaticamente
    }

    // --- Exportação de Projeto (ZIP) ---

    /**
     * Exporta o projeto atual como um arquivo ZIP.
     */
    async function exportProjectAsZip() {
        if (!currentProjectName || !allProjectsData[currentProjectName]) {
            alert("Nenhum projeto aberto para exportar.");
            return;
        }

        const project = allProjectsData[currentProjectName];
        const zip = new JSZip();

        // Adiciona todos os arquivos do projeto ao ZIP
        Object.keys(project.files).forEach(filePath => {
            const file = project.files[filePath];
            if (file.content !== undefined) { // Adiciona apenas arquivos com conteúdo (não pastas vazias)
                zip.file(filePath, file.content);
            }
        });

        logToCustomConsole(`Gerando ZIP para "${currentProjectName}"...`, "info");
        try {
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `${currentProjectName}.zip`);
            logToCustomConsole(`Projeto "${currentProjectName}" exportado com sucesso!`, "info");
        } catch (error) {
            logToCustomConsole(`Erro ao exportar projeto: ${error.message}`, "error");
            alert(`Erro ao exportar projeto: ${error.message}`);
        }
    }


    // --- Inicialização e Listeners de Eventos ---

    /**
     * Inicializa a aplicação.
     */
    function initializeApp() {
        loadProjectsFromLocalStorage();
        renderProjectList();

        // Tenta abrir o último projeto ativo ou um projeto padrão
        if (Object.keys(allProjectsData).length === 0) {
            // Se não houver projetos, exibe o conteúdo de boas-vindas no editor e na árvore
            currentProjectNameSpan.textContent = 'Nenhum';
            fileTreeElement.innerHTML = '<li>Crie um novo projeto para começar.</li>';
            
            // Inicializa o editor principal com o conteúdo de boas-vindas
            editor = createEditorInstanceForTab(codeEditorTextarea, 'htmlmixed');
            editor.setValue(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao Tela Preta!</title>
    <style>
        body {
            font-family: sans-serif;
            background-color: #333;
            color: #eee;
            margin: 20px;
        }
        h1 {
            color: #00ff00;
        }
    </style>
</head>
<body>
    <h1>Crie seu primeiro projeto!</h1>
    <p>Use o botão "Novo Projeto" na barra lateral para começar.</p>
    <script>
        console.log("Olá, Concego! Editor pronto.");
    </script>
</body>
</html>`);
            renderEditorTabs(); // Renderiza as abas (vazio)
        } else {
            // Abre o último projeto ativo ou o primeiro se não houver um ativo
            const lastActiveProject = localStorage.getItem('lastActiveProject');
            if (lastActiveProject && allProjectsData[lastActiveProject]) {
                openProject(lastActiveProject);
            } else {
                openProject(Object.keys(allProjectsData)[0]); // Abre o primeiro projeto encontrado
            }
            // A inicialização do editor e a abertura do primeiro arquivo
            // serão tratadas por openProject -> openFileInProject -> switchTab
        }
        logToCustomConsole("Aplicação inicializada.", "info");
    }


    // --- Listeners de Eventos dos Botões ---
    newProjectButton.addEventListener('click', createNewProject);
    openProjectButton.addEventListener('click', () => {
        let projectName = prompt("Digite o nome do projeto para abrir:");
        if (projectName) {
            openProject(projectName.trim());
        }
    });
    renameProjectButton.addEventListener('click', renameCurrentProject);
    deleteProjectButton.addEventListener('click', deleteCurrentProject);

    newFileButton.addEventListener('click', createNewFileOrFolder);
    renameFileButton.addEventListener('click', renameFileInProject);
    deleteFileButton.addEventListener('click', deleteFileInProject);

    runCodeButton.addEventListener('click', runCode);
    exportProjectButton.addEventListener('click', exportProjectAsZip);

    // Listeners para as abas de saída (Preview/Console)
    previewTabButton.addEventListener('click', () => showOutputPanel('preview-iframe'));
    consoleTabButton.addEventListener('click', () => showOutputPanel('console-output'));


    // --- Início da Aplicação ---
    initializeApp();
});
