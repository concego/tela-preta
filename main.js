const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let terminalWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
}

function createTerminalWindow() {
  if (terminalWindow) {
    terminalWindow.focus();
    return;
  }

  terminalWindow = new BrowserWindow({
    width: 600,
    height: 400,
    autoHideMenuBar: true, 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  terminalWindow.loadFile('terminal.html');

  terminalWindow.on('closed', () => {
    terminalWindow = null;
    if (mainWindow) {
      mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  
  ipcMain.on('abrir-terminal', () => {
    createTerminalWindow();
  });

  // Ouve o pedido para abrir PASTA (Workspace)
  ipcMain.handle('abrir-pasta-workspace', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Selecione a pasta do seu projeto'
    });
    
    if (result.canceled) return null;

    const folderPath = result.filePaths[0];
    
    try {
      const items = fs.readdirSync(folderPath, { withFileTypes: true });
      const conteudo = items.map(item => ({
        nome: item.name,
        isDiretorio: item.isDirectory()
      }));

      return {
        caminho: folderPath,
        nomePasta: path.basename(folderPath),
        conteudo: conteudo
      };
    } catch (error) {
      return { erro: 'Não foi possível ler a pasta.' };
    }
  });

  // --- A MÁGICA NOVA: Ouve o pedido para abrir ARQUIVO AVULSO ---
  ipcMain.handle('abrir-arquivo-avulso', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      title: 'Selecione um arquivo para abrir'
    });
    
    if (result.canceled) return null;
    return result.filePaths[0]; // Retorna o caminho exato do arquivo
  });

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});