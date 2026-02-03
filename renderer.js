const shell = require('electron').shell;
const viewDashboard = document.getElementById('view-dashboard');
const viewBrowser = document.getElementById('view-browser');
const webViewer = document.getElementById('web-viewer');
const browserTitle = document.getElementById('browser-title');
const viewAbout = document.getElementById('view-about');


const BASE_GIST_URL = "https://gist.githubusercontent.com/Retho2021/4b917cfa380ac453979435c0fae5016b/raw/data.json";
const DATA_URL = `${BASE_GIST_URL}?t=${Date.now()}`;
const grid = document.getElementById('project-grid');
const { ipcRenderer } = require('electron'); // On ajoute ipcRenderer

// --- GESTION BARRE DE TITRE ---
document.getElementById('btn-min').addEventListener('click', () => {
    ipcRenderer.send('minimize-app');
});

document.getElementById('btn-max').addEventListener('click', () => {
    ipcRenderer.send('maximize-app');
});

document.getElementById('btn-close').addEventListener('click', () => {
    ipcRenderer.send('close-app');
});

let projects = [];

function showAboutPage() {
    // On cache tout le reste
    viewDashboard.style.display = 'none';
    viewBrowser.style.display = 'none';
    webViewer.src = 'about:blank'; // Stop les vidéos si on était sur le navigateur
    
    // On affiche la page À propos
    viewAbout.style.display = 'block';

    // Mise à jour visuelle du menu (optionnel)
    updateActiveButton('showAboutPage'); 
}
// Fonction pour récupérer les données en ligne
async function fetchProjects() {
    try {
        const response = await fetch(DATA_URL);
        projects = await response.json(); // On remplit la variable projects
        displayProjects('all'); // On affiche tout au démarrage
    } catch (error) {
        grid.innerHTML = `<p style="color:red">Erreur de chargement: ${error.message}</p>`;
    }
}

function displayProjects(filter = 'all') {
    grid.innerHTML = '';
    
    projects.forEach(proj => {
        if (filter === 'all' || proj.category === filter) {
            const card = document.createElement('div');
            card.className = 'card';
            const tagColorClass = proj.category === 'dev' ? 'tag-dev' : 'tag-cine';

            // On crée le HTML
            card.innerHTML = `
                <div class="card-img" style="background-image: url('${proj.image}')"></div>
                <div class="card-info">
                    <div class="card-tag ${tagColorClass}">${proj.category.toUpperCase()}</div>
                    <h3>${proj.title}</h3>
                    <p>${proj.desc}</p>
                </div>
            `;
            
            // --- GESTION DU CLIC (Ouvrir le projet) ---
            card.addEventListener('click', () => {
                openProjectInApp(proj.link, proj.title);
            });

            // --- GESTION DU GIF (Effet Cinéma) ---
            // On cible l'image à l'intérieur de la carte
            const imgDiv = card.querySelector('.card-img');

            // Seulement si un GIF est défini dans le JSON
            if (proj.gif) {
                // Quand la souris ENTRE
                card.addEventListener('mouseenter', () => {
                    imgDiv.style.backgroundImage = `url('${proj.gif}')`;
                });

                // Quand la souris SORT
                card.addEventListener('mouseleave', () => {
                    imgDiv.style.backgroundImage = `url('${proj.image}')`;
                });
            }

            grid.appendChild(card);
        }
    });
}



// Nouvelle fonction pour ouvrir DANS l'app
function openProjectInApp(url, title) {
    // 1. On change l'interface
    viewDashboard.style.display = 'none'; // Cache la grille
    viewBrowser.style.display = 'flex';   // Affiche le navigateur
    
    // 2. On charge l'URL
    browserTitle.innerText = title;
    webViewer.src = url;
}

// Fonction pour fermer et revenir à la liste
function closeProject() {
    viewDashboard.style.display = 'block';
    viewBrowser.style.display = 'none';
    webViewer.src = 'about:blank'; // On vide le navigateur pour arrêter le son/vidéo
}

// Fonction pour filtrer les projets

function filterProjects(type) {
    closeProject(); // Ça ferme le navigateur
    viewAbout.style.display = 'none';
    
    updateActiveButton(type);
    displayProjects(type);
}

// Ajoutez cette petite fonction utilitaire juste en dessous
// Elle sert à changer la couleur bleue sur le bouton cliqué
function updateActiveButton(type) {
    // On enlève la classe 'active' de tous les boutons
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // On cherche le bouton qui correspond au type et on l'active
    // (Astuce : on repère le bouton grâce à son texte ou son attribut onclick)
    const buttons = document.querySelectorAll('.menu-item');
    buttons.forEach(btn => {
        // Si le bouton contient l'appel à la fonction du type en cours
        if (btn.getAttribute('onclick').includes(`'${type}'`)) {
            btn.classList.add('active');
        }
    });
}

// Lancement
fetchProjects();
filterProjects('all');  // On affiche tout au démarrage

// --- GESTION DES NEWS AUTOMATIQUES ---
async function loadNews() {
    const newsContainer = document.getElementById('news-container'); // On va créer ce div après
    const user = 'Retho2021'; // Votre pseudo
    const repo = 'mainline-launcher'; // Votre repo

    try {
        // On demande à GitHub les issues avec le label 'news'
        const response = await fetch(`https://api.github.com/repos/${user}/${repo}/issues?labels=news&state=open`);
        const data = await response.json();

        newsContainer.innerHTML = ''; // On vide le chargement

        if (data.length === 0) {
            newsContainer.innerHTML = '<p class="no-news">Aucune actualité pour le moment.</p>';
            return;
        }

        // Pour chaque news trouvée...
        data.forEach(item => {
            const date = new Date(item.created_at).toLocaleDateString('fr-FR');
            
            // On crée la carte HTML
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            newsCard.innerHTML = `
                <div class="news-header">
                    <span class="news-tag">INFO</span>
                    <span class="news-date">${date}</span>
                </div>
                <h4>${item.title}</h4>
                <p>${item.body.substring(0, 100)}...</p> <a href="${item.html_url}" target="_blank" class="read-more">Lire la suite ➜</a>
            `;
            newsContainer.appendChild(newsCard);
        });

    } catch (error) {
        console.error('Erreur news:', error);
        newsContainer.innerHTML = '<p class="error-msg">Impossible de charger les actus.</p>';
    }
}

// N'oubliez pas de lancer la fonction au démarrage !
loadNews();