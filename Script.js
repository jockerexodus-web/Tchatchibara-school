/* ============================================================
   DONNÉES DES COURS
   ============================================================ */
const coursData = [
    { id: 1, niveau: "1ère", matiere: "Mathématiques", titre: "Fonctions et Dérivées", desc: "Étude complète des fonctions polynômes, limites et calcul de dérivées.", pdf: "maths_1ere_derivées.pdf" },
    { id: 2, niveau: "1ère", matiere: "Physique-Chimie", titre: "Les Forces et Mouvements", desc: "Lois de Newton, mouvement rectiligne et applications pratiques.", pdf: "physique_1ere_forces.pdf" },
    { id: 3, niveau: "1ère", matiere: "Français", titre: "Le Roman et ses Personnages", desc: "Analyse littéraire, commentaire composé et dissertation.", pdf: "francais_1ere_roman.pdf" },
    { id: 4, niveau: "1ère", matiere: "Histoire-Géo", titre: "La Révolution Industrielle", desc: "Transformations économiques et sociales du XIXe siècle.", pdf: "histoire_1ere_revolution.pdf" },
    { id: 5, niveau: "1ère", matiere: "SVT", titre: "La Cellule et l'ADN", desc: "Structure cellulaire, division et transmission génétique.", pdf: "svt_1ere_cellule.pdf" },
    { id: 6, niveau: "1ère", matiere: "Anglais", titre: "Grammar & Composition", desc: "Temps verbaux, vocabulaire et rédaction en anglais.", pdf: "anglais_1ere_grammar.pdf" },
    { id: 7, niveau: "Terminale", matiere: "Mathématiques", titre: "Intégrales et Équations Différentielles", desc: "Calcul intégral, primitives et résolution d'équations.", pdf: "maths_term_integrales.pdf" },
    { id: 8, niveau: "Terminale", matiere: "Physique-Chimie", titre: "Électricité et Magnétisme", desc: "Circuits électriques, champs magnétiques et induction.", pdf: "physique_term_electricite.pdf" },
    { id: 9, niveau: "Terminale", matiere: "Philosophie", titre: "La Liberté et le Déterminisme", desc: "Dissertation philosophique et analyse de textes.", pdf: "philo_term_liberte.pdf" },
    { id: 10, niveau: "Terminale", matiere: "SVT", titre: "Génétique et Évolution", desc: "Hérédité, mutations et mécanismes de l'évolution.", pdf: "svt_term_genetique.pdf" },
    { id: 11, niveau: "Terminale", matiere: "Histoire-Géo", titre: "La Guerre Froide", desc: "Tensions Est-Ouest et nouveaux enjeux mondiaux.", pdf: "histoire_term_guerre_froide.pdf" },
    { id: 12, niveau: "Terminale", matiere: "Anglais", titre: "Literature & Civilization", desc: "Textes littéraires et civilisation anglophone.", pdf: "anglais_term_literature.pdf" }
];

let filtreNiveauActif = "tous";
let filtreRecherche = "";
let coursConsultes = 0;
let pdfTelecharges = 0;

/* ============================================================
   AFFICHAGE DES COURS (page cours.html)
   ============================================================ */
function afficherCours() {
    const grid = document.getElementById("coursGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const coursFiltres = coursData.filter(c => {
        const matchNiveau = filtreNiveauActif === "tous" || c.niveau === filtreNiveauActif;
        const matchRecherche = c.titre.toLowerCase().includes(filtreRecherche) ||
                                c.matiere.toLowerCase().includes(filtreRecherche) ||
                                c.niveau.toLowerCase().includes(filtreRecherche);
        return matchNiveau && matchRecherche;
    });

    if (coursFiltres.length === 0) {
        grid.innerHTML = "<p style='grid-column:1/-1; text-align:center; color:#999; font-size:18px;'>Aucun cours trouvé.</p>";
        return;
    }

    coursFiltres.forEach(c => {
        grid.innerHTML += `
            <div class="carte-cours">
                <div class="matiere">${c.matiere}</div>
                <h3>${c.titre}</h3>
                <span class="niveau-tag">${c.niveau}</span>
                <p>${c.desc}</p>
                <a class="btn-pdf" onclick="telechargerPDF('${c.pdf}', '${c.titre}')">📥 Télécharger le PDF</a>
            </div>`;
    });
}

/* ============================================================
   FILTRES
   ============================================================ */
function filtrerNiveau(niveau, btn) {
    filtreNiveauActif = niveau;
    document.querySelectorAll(".niveau-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    afficherCours();
}

function rechercher(texte) {
    filtreRecherche = texte.toLowerCase();
    afficherCours();
}

/* ============================================================
   TÉLÉCHARGEMENT PDF (simulé)
   ============================================================ */
function telechargerPDF(nomFichier, titreCours) {
    const contenu = `TCHATCHIBARA SCHOOL\n\nCours : ${titreCours}\n\nFichier original : ${nomFichier}\n\nCeci est un document éducatif de démonstration.\nBonne lecture et bon courage !\n\n© 2025 Tchatchibara School`;
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
    alert(`✅ Le cours "${titreCours}" a été téléchargé !`);
}

/* ============================================================
   GESTION DES COMPTES
   ============================================================ */
function creerCompte(event) {
    event.preventDefault();
    const nom = document.getElementById("signupNom").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const niveau = document.getElementById("signupNiveau").value;

    if (!nom || !email || !password) { alert("❌ Veuillez remplir tous les champs."); return; }

    const compte = { nom, email, password, niveau };
    localStorage.setItem("tchatchibara_user", JSON.stringify(compte));
    alert(`🎉 Bienvenue ${nom} ! Votre compte a été créé avec succès.`);
    window.location.href = "profil.html";
}

function connexion(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const sauvegarde = localStorage.getItem("tchatchibara_user");
    if (!sauvegarde) { alert("❌ Aucun compte trouvé. Veuillez d'abord créer un compte."); return; }

    const compte = JSON.parse(sauvegarde);
    if (compte.email === email && compte.password === password) {
        alert(`✅ Connexion réussie. Bienvenue ${compte.nom} !`);
        window.location.href = "profil.html";
    } else {
        alert("❌ Email ou mot de passe incorrect.");
    }
}

/* ============================================================
   MISE À JOUR DU PROFIL
   ============================================================ */
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
