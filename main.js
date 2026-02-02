const { app, BrowserWindow } = require('electron');
const path = require('path');

// On définit les variables des fenêtres en dehors pour qu'elles soient accessibles partout
let mainWindow;
let splashWindow;

const createWindows = () => {
  // 1. Création de la fenêtre principale (cachée au début)
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "MainLine Studio - Hub",
    autoHideMenuBar: true,
    show: false, // <-- IMPORTANT : Elle est créée mais invisible
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    }
  });

  mainWindow.loadFile('index.html');

  // 2. Création de la fenêtre de Splash Screen (visible immédiatement)
  splashWindow = new BrowserWindow({
    width: 600,
    height: 400,
    transparent: false, // Si true, le fond carré disparaît (plus complexe à gérer)
    frame: false,       // Pas de barre de titre ni de bordures Windows
    alwaysOnTop: true,  // Reste au premier plan
    resizable: false,
    webPreferences: {
        nodeIntegration: false // Pas besoin de Node ici
    }
  });

  splashWindow.loadFile('splash.html');
  splashWindow.center(); // On la centre sur l'écran

  // --- LA LOGIQUE DE TRANSITION ---

  // Quand la fenêtre principale est prête visuellement :
  mainWindow.once('ready-to-show', () => {
    // On attend un petit peu (ex: 2.5 secondes) pour laisser l'utilisateur voir le logo
    // C'est purement esthétique.
    setTimeout(() => {
        splashWindow.close(); // On ferme le splash
        mainWindow.show();    // On affiche la principale
        splashWindow = null;  // Nettoyage mémoire
    }, 5500); 
  });
};

// Démarrage de l'app
app.whenReady().then(() => {
    createWindows();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindows();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});