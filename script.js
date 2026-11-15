/* ================= DONNÉES COURS ================= */
const coursData = [
    { id: 1, niveau: "2nde", matiere: "Mathématiques", titre: "Fonctions et Équations", desc: "Généralités sur les fonctions, résolution d'équations et inéquations.", pdf: "maths_2nde_fonctions.pdf" },
    { id: 2, niveau: "2nde", matiere: "Physique-Chimie", titre: "Mécanique et Chimie", desc: "Forces, mouvements et structure de la matière.", pdf: "physique_2nde_meca.pdf" },
    { id: 3, niveau: "1ère", matiere: "Mathématiques", titre: "Dérivées et Étude de Fonctions", desc: "Calcul de dérivées, limites et tableaux de variation.", pdf: "maths_1ere_deriv.pdf" },
    { id: 4, niveau: "1ère", matiere: "Français", titre: "Le Roman et ses Personnages", desc: "Analyse littéraire, commentaire composé et dissertation.", pdf: "francais_1ere_roman.pdf" },
    { id: 5, niveau: "1ère", matiere: "SVT", titre: "La Cellule et l'ADN", desc: "Structure cellulaire, division et transmission génétique.", pdf: "svt_1ere_cellule.pdf" },
    { id: 6, niveau: "Terminale", matiere: "Mathématiques", titre: "Intégrales et Équations Différentielles", desc: "Calcul intégral, primitives et résolution d'équations.", pdf: "maths_term_integrales.pdf" },
    { id: 7, niveau: "Terminale", matiere: "Philosophie", titre: "La Liberté et le Déterminisme", desc: "Dissertation philosophique et analyse de textes.", pdf: "philo_term_liberte.pdf" },
    { id: 8, niveau: "Terminale", matiere: "SVT", titre: "Génétique et Évolution", desc: "Hérédité, mutations et mécanismes de l'évolution.", pdf: "svt_term_genetique.pdf" },
    { id: 9, niveau: "Terminale", matiere: "Histoire-Géo", titre: "Épreuves Bac - Histoire", desc: "Sujets corrigés du Bac et méthodologie.", pdf: "bac_histoire.pdf" },
    { id: 10, niveau: "Terminale", matiere: "Mathématiques", titre: "Épreuves Bac - Maths", desc: "Annales corrigées du Baccalauréat.", pdf: "bac_maths.pdf" }
];

let filtreNiveauActif = "tous";
let coursConsultes = 0;
let pdfTelecharges = 0;

/* ================= NAVIGATION ENTRE PAGES ================= */
function goToPage(page, niveau = null) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const pageEl = document.getElementById("page-" + page);
    if (pageEl) pageEl.classList.add("active");

    // Mettre à jour la bottom nav
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    const navItems = document.querySelectorAll(".nav-item");
    if (page === "accueil") navItems[0].classList.add("active");
    if (page === "cours") navItems[1].classList.add("active");
    if (page === "profil") navItems[2].classList.add("active");

    if (page === "cours") {
        if (niveau) {
            filtreNiveauActif = niveau;
            document.querySelectorAll(".btn-niveau").forEach(b => b.classList.remove("active-niv"));
        }
        afficherCours();
    }
    if (page === "profil") mettreAJourProfil();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ================= AFFICHAGE DES COURS ================= */
function afficherCours() {
    const grid = document.getElementById("coursGrid");
    if (!grid) return;
    grid.innerHTML = "";

    let coursFiltres = coursData;
    if (filtreNiveauActif === "Bac") {
        coursFiltres = coursData.filter(c => c.titre.includes("Bac") || c.matiere.includes("Bac"));
    } else if (filtreNiveauActif !== "tous") {
        coursFiltres = coursData.filter(c => c.niveau === filtreNiveauActif);
    }

    if (coursFiltres.length === 0) {
        grid.innerHTML = "<p style='grid-column:1/-1; text-align:center; color:#9fb4d4; padding:30px;'>Aucun cours disponible.</p>";
        return;
    }

    coursFiltres.forEach(c => {
        grid.innerHTML += `
            <div class="carte-app">
                <div class="matiere">${c.matiere}</div>
                <h3>${c.titre}</h3>
                <span class="niveau-tag">${c.niveau}</span>
                <p>${c.desc}</p>
                <a class="btn-pdf" onclick="telechargerPDF('${c.pdf}', '${c.titre}')">📥 Télécharger le PDF</a>
            </div>`;
    });
}

function filtrerNiveau(niveau, btn) {
    filtreNiveauActif = niveau;
    document.querySelectorAll(".btn-niveau").forEach(b => b.classList.remove("active-niv"));
    btn.classList.add("active-niv");
    afficherCours();
}

/* ================= TÉLÉCHARGEMENT PDF ================= */
function telechargerPDF(nomFichier, titreCours) {
    const contenu = `TCHATCHIBARA-WEB SCHOOL\n\nCours : ${titreCours}\n\nFichier : ${nomFichier}\n\nPlateforme éducative conforme au programme officiel du Gabon.\n\n© 2025 SAKAMOTO Dev.`;
    const blob = new Blob([contenu], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier.replace('.pdf', '.txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    pdfTelecharges++;
    coursConsultes++;
    localStorage.setItem("tchatchibara_stats", JSON.stringify({ pdfTelecharges, coursConsultes }));
    alert(`✅ "${titreCours}" téléchargé !`);
}

/* ================= PROFIL ================= */
function mettreAJourProfil() {
    const stats = JSON.parse(localStorage.getItem("tchatchibara_stats") || '{"pdfTelecharges":0,"coursConsultes":0}');
    const sauvegarde = localStorage.getItem("tchatchibara_user");

    if (sauvegarde) {
        const u = JSON.parse(sauvegarde);
        document.getElementById("avatar").textContent = u.nom.charAt(0).toUpperCase();
        document.getElementById("profilNom").textContent = u.nom;
        document.getElementById("profilEmail").textContent = u.email;
        document.getElementById("statNiveau").textContent = u.niveau || "-";
    } else {
        document.getElementById("avatar").textContent = "?";
        document.getElementById("profilNom").textContent = "Invité";
        document.getElementById("profilEmail").textContent = "Connectez-vous pour voir votre profil";
        document.getElementById("statNiveau").textContent = "-";
    }
    document.getElementById("statCours").textContent = stats.coursConsultes;
    document.getElementById("statPdf").textContent = stats.pdfTelecharges;
}
function goToPage(page, niveau = null) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const pageEl = document.getElementById("page-" + page);
    if (pageEl) pageEl.classList.add("active");

    // Mettre à jour la bottom nav (5 onglets)
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    const navItems = document.querySelectorAll(".nav-item");
    if (page === "accueil") navItems[0].classList.add("active");
    if (page === "cours") navItems[1].classList.add("active");
    if (page === "communaute") navItems[2].classList.add("active");
    if (page === "commentaires") navItems[3].classList.add("active");
    if (page === "profil") navItems[4].classList.add("active");

    if (page === "cours") {
        if (niveau) {
            filtreNiveauActif = niveau;
            document.querySelectorAll(".btn-niveau").forEach(b => b.classList.remove("active-niv"));
        }
        afficherCours();
    }
    if (page === "profil") mettreAJourProfil();
    if (page === "communaute") chargerMessages();
    if (page === "commentaires") chargerCommentaires();

    window.scrollTo({ top: 0, behavior: "smooth" });
}
/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
    afficherCours();
    mettreAJourProfil();
});
