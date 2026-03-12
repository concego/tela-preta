const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let terminalProcess = null;
let workspaceAtual = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

// Gerenciamento de Pastas e Arquivos
ipcMain.handle('abrir-pasta-workspace', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    if (!result.canceled && result.filePaths.length > 0) {
        workspaceAtual = result.filePaths[0];
        return { caminho: workspaceAtual, nomePasta: path.basename(workspaceAtual) };
    }
    return null;
});

ipcMain.handle('abrir-arquivo-avulso', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile']
    });
    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});

// --- O NOVO MOTOR V8 DA CAIXA PRETA ---
ipcMain.on('abrir-terminal', (event) => {
    const terminalWin = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Caixa Preta',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    
    terminalWin.setMenu(null);
    terminalWin.loadFile('terminal.html');

    if (terminalProcess) {
        terminalProcess.kill();
    }

    const pastaAlvo = workspaceAtual || process.env.USERPROFILE;

    // A Mágica Bruta do UTF-8: chcp 65001 obriga o Windows a respeitar os acentos
    terminalProcess = spawn('powershell.exe', ['-NoExit', '-NoLogo', '-Command', 'chcp 65001; [Console]::OutputEncoding=[System.Text.Encoding]::UTF8'], {
        cwd: pastaAlvo,
        shell: true 
    });

    terminalProcess.stdout.on('data', (data) => {
        if (!terminalWin.isDestroyed()) {
            terminalWin.webContents.send('terminal-output', data.toString('utf8'));
        }
    });

    terminalProcess.stderr.on('data', (data) => {
        if (!terminalWin.isDestroyed()) {
            terminalWin.webContents.send('terminal-output', data.toString('utf8'));
        }
    });

    ipcMain.removeAllListeners('terminal-input');
    ipcMain.on('terminal-input', (e, comando) => {
        if (terminalProcess) {
            terminalProcess.stdin.write(comando + '\n');
        }
    });

    terminalWin.on('closed', () => {
        if (terminalProcess) {
            terminalProcess.kill();
            terminalProcess = null;
        }
    });
});