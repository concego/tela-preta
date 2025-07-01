document.addEventListener('DOMContentLoaded', () => {
    const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        lineNumbers: true,
        theme: 'monokai',
        mode: 'javascript',
        extraKeys: { 'Ctrl-Space': 'autocomplete' }
    });

    const languageSelect = document.getElementById('language');
    const saveButton = document.getElementById('save');
    const exportButton = document.getElementById('export');
    const helpButton = document.getElementById('help');
    const autocompleteButton = document.getElementById('autocomplete');
    const helpSection = document.getElementById('help-section');
    const historyList = document.getElementById('history-list');

    let history = JSON.parse(localStorage.getItem('codeHistory')) || [];

    const modeMap = {
        javascript: { name: 'javascript' },
        json: { name: 'javascript', json: true },
        html: 'htmlmixed',
        css: 'css',
        python: 'python',
        markdown: 'markdown',
        xml: 'xml',
        clike: 'clike'
    };

    const extensionMap = {
        javascript: '.js',
        json: '.json',
        html: '.html',
        css: '.css',
        python: '.py',
        markdown: '.md',
        xml: '.xml',
        clike: '.cpp'
    };

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

    const validateFileName = (name) => {
        const invalidChars = /[\/\\:*?"<>|]/;
        return !invalidChars.test(name) && name.trim() !== '';
    };

    window.loadFile = (index) => {
        const item = history[index];
        editor.setValue(item.content);
        languageSelect.value = item.language;
        editor.setOption('mode', modeMap[item.language]);
        alert(`Arquivo ${item.name} carregado.`);
    };

    window.deleteFile = (index) => {
        if (confirm(`Excluir ${history[index].name}?`)) {
            history.splice(index, 1);
            localStorage.setItem('codeHistory', JSON.stringify(history));
            loadHistory();
            alert('Arquivo excluído.');
        }
    };

    languageSelect.addEventListener('change', () => {
        const mode = modeMap[languageSelect.value];
        editor.setOption('mode', mode);
    });

    saveButton.addEventListener('click', () => {
        const name = prompt('Digite o nome do arquivo:');
        if (name && validateFileName(name)) {
            const content = editor.getValue();
            const language = languageSelect.value;
            history.push({ name, content, language });
            localStorage.setItem('codeHistory', JSON.stringify(history));
            loadHistory();
            alert('Arquivo salvo.');
        } else {
            alert('Nome de arquivo inválido.');
        }
    });

    exportButton.addEventListener('click', () => {
        const name = prompt('Digite o nome do arquivo ZIP:');
        if (name && validateFileName(name)) {
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
        } else {
            alert('Nome de arquivo inválido.');
        }
    });

    helpButton.addEventListener('click', () => {
        helpSection.style.display = helpSection.style.display === 'none' ? 'block' : 'none';
    });

    autocompleteButton.addEventListener('click', () => {
        editor.execCommand('autocomplete');
    });

    loadHistory();
});