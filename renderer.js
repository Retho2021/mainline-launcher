const shell = require('electron').shell;
const viewDashboard = document.getElementById('view-dashboard');
const viewBrowser = document.getElementById('view-browser');
const webViewer = document.getElementById('web-viewer');
const browserTitle = document.getElementById('browser-title');
const viewAbout = document.getElementById('view-about');


const BASE_GIST_URL = "https://gist.githubusercontent.com/Retho2021/4b917cfa380ac453979435c0fae5016b/raw/data.json";
const DATA_URL = `${BASE_GIST_URL}?t=${Date.now()}`;
const grid = document.getElementById('project-grid');
let projects = []; // On stocke les projets ici une fois chargés

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

            card.innerHTML = `
                <div class="card-img" style="background-image: url('${proj.image}')"></div>
                <div class="card-info">
                    <div class="card-tag ${tagColorClass}">${proj.category.toUpperCase()}</div>
                    <h3>${proj.title}</h3>
                    <p>${proj.desc}</p>
                </div>
            `;
            
            // --- CHANGEMENT ICI ---
            // Au clic, on appelle notre fonction interne
            card.addEventListener('click', () => {
                openProjectInApp(proj.link, proj.title);
            });

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