const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let splashWindow;

const createWindows = () => {
// 1. Fenêtre Principale
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    
    // --- LE BLOC ANTI-BARRE BLANCHE ---
    frame: false,             // La méthode classique
    titleBarStyle: 'hidden',  // La méthode MacOS/Windows moderne
    titleBarOverlay: false,   // Désactive les contrôles système par dessus
    thickFrame: false,        // Enlève la bordure de redimensionnement Windows native
    // ----------------------------------

    show: false,
    backgroundColor: '#121212',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    }
  });

  mainWindow.loadFile('index.html');

  // 2. Splash Screen
  splashWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    transparent: true, // Si votre logo est png transparent, c'est mieux
    webPreferences: { nodeIntegration: false }
  });

  splashWindow.loadFile('splash.html');
  splashWindow.center();

  // Transition
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
        if (splashWindow) splashWindow.close();
        mainWindow.show();
    }, 3000); 
  });
};

// --- NOUVEAU : Écoute des boutons de NOTRE barre de titre ---
ipcMain.on('minimize-app', () => mainWindow.minimize());
ipcMain.on('maximize-app', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});
ipcMain.on('close-app', () => app.quit());

// Démarrage standard
app.whenReady().then(() => {
    createWindows();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindows();
    });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });