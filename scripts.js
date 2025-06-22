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
    editor.on('change', updatePreview);
    loadSavedCode();
}

function changeLanguage() {
    const select = document.getElementById('languageSelect');
    const mode = select.value;
    editor.setOption('mode', mode);
    updatePreview();
    document.getElementById('status').textContent = `Linguagem alterada para ${select.options[select.selectedIndex].text}`;
}

function saveCode() {
    localStorage.setItem('savedCode', editor.getValue());
    document.getElementById('status').textContent = 'Código salvo com sucesso';
}

function loadSavedCode() {
    const savedCode = localStorage.getItem('savedCode');
    if (savedCode) {
        editor.setValue(savedCode);
    }
}

function exportCode() {
    const zip = new JSZip();
    const code = editor.getValue();
    const language = document.getElementById('languageSelect').value;
    let extension = 'txt';
    if (language === 'text/html') extension = 'html';
    else if (language === 'text/css') extension = 'css';
    else if (language === 'text/javascript') extension = 'js';
    else if (language === 'text/x-python') extension = 'py';
    else if (language === 'text/x-csrc') extension = 'c';
    else if (language === 'text/markdown') extension = 'md';
    zip.file(`code.${extension}`, code);
    zip.generateAsync({type: 'blob'}).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'code.zip';
        a.click();
        window.URL.revokeObjectURL(url);
        document.getElementById('status').textContent = 'Código exportado como ZIP';
    });
}

function resetCode() {
    editor.setValue('');
    localStorage.removeItem('savedCode');
    updatePreview();
    document.getElementById('status').textContent = 'Código resetado';
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    editor.setOption('theme', isDarkTheme ? 'monokai' : 'default');
    document.body.style.backgroundColor = isDarkTheme ? '#1e1e1e' : '#fff';
    document.body.style.color = isDarkTheme ? '#fff' : '#000';
    document.getElementById('status').textContent = `Tema alterado para ${isDarkTheme ? 'escuro' : 'claro'}`;
}

function updatePreview() {
    const code = editor.getValue();
    const language = document.getElementById('languageSelect').value;
    const preview = document.getElementById('preview');
    if (language === 'text/html') {
        preview.contentDocument.open();
        preview.contentDocument.write(code);
        preview.contentDocument.close();
    } else {
        preview.contentDocument.body.innerText = code;
    }
}

window.onload = initializeEditor;
