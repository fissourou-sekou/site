/* Sékou Fissourou, peintre en bâtiment : interactions du site.
   - menu mobile et lien actif dans le menu
   - visionneuse plein écran des photos et vidéos
   - filtres de la page Réalisations
   - avant / après avec curseur
   - nuancier « Essayez une teinte »
   - formulaire de devis (WhatsApp ou email, aucun serveur nécessaire)
   Chaque partie ne s'active que si les éléments existent sur la page. */
(function () {
  "use strict";

  /* ==========================================================
     À MODIFIER : coordonnées de Sékou
     - telephoneAffiche : le numéro tel qu'il apparaît dans les messages (pages françaises)
     - telephoneInternational : le même numéro pour les pages anglaises (+33, sans le 0)
     - whatsapp : le numéro au format international, sans « + » ni espaces
                  (33 + le numéro sans le 0 : 07 83 44 03 11 -> 33783440311)
     - email : l'adresse qui reçoit les demandes de devis
     Le texte affiché dans les pages se modifie dans les fichiers HTML (français et anglais).
     ========================================================== */
  var CONFIG = {
    telephoneAffiche: "07 83 44 03 11",
    telephoneInternational: "+33 7 83 44 03 11",
    whatsapp: "33783440311",
    email: "fissourousekou@gmail.com"
  };

  /* Textes affichés par le script, en français et en anglais.
     La langue suit l'attribut lang de la balise <html> de la page (fr ou en). */
  var EN = /^en/i.test(document.documentElement.getAttribute("lang") || "");
  var TXT = EN ? {
    visionneuse: "Project photos and videos", fermer: "Close", prec: "Previous", suiv: "Next",
    plus: function (n, reste) { return "Show " + n + " more (" + reste + " left)"; },
    statut: { "tout": " photos and videos", "video": " videos", "papier-peint": " wallpaper projects", "peinture": " painting projects", "renovation": " renovation projects" },
    avap: function (v) { return "Before photo: " + v + "% visible"; },
    interieur: "interior", facade: "exterior",
    teinteAjoutee: "Colour added to your request: ",
    copie: "Copied", selection: "Selected",
    bonjour: "Hello Sékou, I would like a quote.", sep: ": ",
    champs: { nom: "Name", tel: "Phone", ville: "Town or postcode", bien: "Property type", travaux: "Work needed", surface: "Area or rooms", delai: "Timeframe", teinte: "Preferred colour" },
    sujet: "Quote request",
    incomplet: "Please fill in the highlighted fields, then choose WhatsApp or email.",
    pret: "Your request is ready. Choose WhatsApp or email to send it.",
    wa: function (tel) { return "WhatsApp opens in a new tab with your request already written. If nothing opens, copy the request and send it to " + tel + "."; },
    mail: function (email) { return "Your email app should open with the request filled in. If it doesn't, copy the request and send it to " + email + "."; },
    copiee: "Request copied. Paste it into WhatsApp, a text message or an email.",
    selectionnee: "Your request is selected below. Copy it, then paste it into your message.",
    telephone: CONFIG.telephoneInternational
  } : {
    visionneuse: "Photos et vidéos des chantiers", fermer: "Fermer", prec: "Précédente", suiv: "Suivante",
    plus: function (n, reste) { return "Afficher " + n + " de plus (" + reste + " restantes)"; },
    statut: { "tout": " photos et vidéos", "video": " vidéos", "papier-peint": " réalisations en papier peint", "peinture": " réalisations en peinture", "renovation": " réalisations en rénovation" },
    avap: function (v) { return "Photo d'avant visible sur " + v + " %"; },
    interieur: "intérieur", facade: "façade",
    teinteAjoutee: "Teinte ajoutée à votre demande : ",
    copie: "Copié", selection: "Sélectionné",
    bonjour: "Bonjour Sékou, je souhaite un devis.", sep: " : ",
    champs: { nom: "Nom", tel: "Téléphone", ville: "Ville ou code postal", bien: "Type de bien", travaux: "Travaux", surface: "Surface ou pièces", delai: "Délai", teinte: "Teinte souhaitée" },
    sujet: "Demande de devis",
    incomplet: "Complétez les champs signalés, puis choisissez WhatsApp ou email.",
    pret: "Votre demande est prête. Choisissez WhatsApp ou email pour l'envoyer.",
    wa: function (tel) { return "WhatsApp s'ouvre dans un nouvel onglet avec votre demande déjà rédigée. Si rien ne s'ouvre, copiez la demande et envoyez-la au " + tel + "."; },
    mail: function (email) { return "Votre messagerie devrait s'ouvrir avec la demande pré-remplie. Sinon, copiez la demande et envoyez-la à " + email + "."; },
    copiee: "Demande copiée. Collez-la dans WhatsApp, un SMS ou un email.",
    selectionnee: "Le texte de votre demande est sélectionné ci-dessous. Copiez-le, puis collez-le dans votre message.",
    telephone: CONFIG.telephoneAffiche
  };

  function q(sel, racine) { return (racine || document).querySelector(sel); }
  function qa(sel, racine) { return Array.prototype.slice.call((racine || document).querySelectorAll(sel)); }
  function mouvementReduit() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function insecable(t) { return String(t).replace(/ /g, " "); }
  var ICONES = {
    fermer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    prec: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    suiv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
  };

  /* ---------- Menu mobile ---------- */
  var navBouton = q(".nav-bouton");
  var nav = q("#nav");
  function fermerMenu() { navBouton.setAttribute("aria-expanded", "false"); nav.classList.remove("ouverte"); }
  if (navBouton && nav) {
    navBouton.addEventListener("click", function () {
      var ouvert = navBouton.getAttribute("aria-expanded") === "true";
      navBouton.setAttribute("aria-expanded", String(!ouvert));
      nav.classList.toggle("ouverte", !ouvert);
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) fermerMenu(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("ouverte")) { fermerMenu(); navBouton.focus(); }
    });
  }

  /* ---------- Changement de langue : on garde la section ou le filtre en cours ---------- */
  qa("a.langue").forEach(function (a) {
    a.addEventListener("click", function () { if (location.hash) a.hash = location.hash; });
  });

  /* ---------- Lien actif dans le menu (page d'accueil) ---------- */
  var liensSection = qa('.nav a[href^="#"]');
  if (liensSection.length && "IntersectionObserver" in window) {
    var parId = {};
    liensSection.forEach(function (a) { var s = document.getElementById(a.getAttribute("href").slice(1)); if (s) parId[s.id] = a; });
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        var lien = parId[en.target.id];
        if (!lien) return;
        if (en.isIntersecting) {
          liensSection.forEach(function (a) { a.removeAttribute("aria-current"); });
          lien.setAttribute("aria-current", "location");
        } else if (lien.getAttribute("aria-current")) {
          lien.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(parId).forEach(function (id) { observateur.observe(document.getElementById(id)); });
  }

  /* ---------- Visionneuse plein écran ----------
     Tout lien portant data-galerie="nom" s'ouvre dans la visionneuse,
     avec les autres liens du même groupe (flèches, clavier, glisser du doigt). */
  (function () {
    if (!q("[data-galerie]")) return;
    var dlg = document.createElement("dialog");
    dlg.className = "visionneuse";
    dlg.setAttribute("aria-label", TXT.visionneuse);
    dlg.innerHTML =
      '<div class="visionneuse-haut"><p class="visionneuse-compteur" aria-live="polite"></p>' +
      '<button type="button" class="visionneuse-btn visionneuse-fermer" aria-label="' + TXT.fermer + '">' + ICONES.fermer + "</button></div>" +
      '<div class="visionneuse-scene">' +
      '<button type="button" class="visionneuse-btn visionneuse-prec" aria-label="' + TXT.prec + '">' + ICONES.prec + "</button>" +
      '<div class="visionneuse-media"></div>' +
      '<button type="button" class="visionneuse-btn visionneuse-suiv" aria-label="' + TXT.suiv + '">' + ICONES.suiv + "</button></div>" +
      '<div class="visionneuse-bas"><p class="visionneuse-legende"></p></div>';
    document.body.appendChild(dlg);
    var media = q(".visionneuse-media", dlg);
    var scene = q(".visionneuse-scene", dlg);
    var compteur = q(".visionneuse-compteur", dlg);
    var legende = q(".visionneuse-legende", dlg);
    var btnPrec = q(".visionneuse-prec", dlg);
    var btnSuiv = q(".visionneuse-suiv", dlg);
    var groupe = [], index = 0, declencheur = null;

    function membres(nom) {
      return qa('[data-galerie="' + nom + '"]').filter(function (a) {
        var tuile = a.closest(".tuile");
        return !(tuile && tuile.hasAttribute("data-hors-filtre"));
      });
    }
    function viderMedia() {
      var v = q("video", media);
      if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
      media.innerHTML = "";
    }
    function precharger(i) {
      var a = groupe[(i + groupe.length) % groupe.length];
      if (a && a.getAttribute("data-type") !== "video") { var im = new Image(); im.src = a.getAttribute("href"); }
    }
    function afficher(i) {
      if (!groupe.length) return;
      index = (i + groupe.length) % groupe.length;
      var a = groupe[index];
      viderMedia();
      var el;
      if (a.getAttribute("data-type") === "video") {
        el = document.createElement("video");
        el.controls = true; el.autoplay = true; el.muted = true; el.playsInline = true;
        el.setAttribute("playsinline", ""); el.preload = "metadata";
        if (a.getAttribute("data-affiche")) el.poster = a.getAttribute("data-affiche");
        el.src = a.getAttribute("href");
      } else {
        el = document.createElement("img");
        el.alt = a.getAttribute("data-legende") || "";
        el.decoding = "async";
        el.src = a.getAttribute("href");
      }
      if (a.getAttribute("data-largeur")) { el.width = +a.getAttribute("data-largeur"); el.height = +a.getAttribute("data-hauteur"); }
      media.appendChild(el);
      legende.textContent = a.getAttribute("data-legende") || "";
      compteur.textContent = groupe.length > 1 ? (index + 1) + " / " + groupe.length : "";
      btnPrec.hidden = btnSuiv.hidden = groupe.length < 2;
      precharger(index + 1); precharger(index - 1);
    }
    function ouvrir(a) {
      groupe = membres(a.getAttribute("data-galerie"));
      declencheur = a;
      document.documentElement.classList.add("visionneuse-ouverte");
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      afficher(Math.max(0, groupe.indexOf(a)));
      q(".visionneuse-fermer", dlg).focus();
    }
    function fermer() {
      if (typeof dlg.close === "function" && dlg.open) dlg.close();
      else { dlg.removeAttribute("open"); apresFermeture(); }
    }
    function apresFermeture() {
      viderMedia();
      document.documentElement.classList.remove("visionneuse-ouverte");
      if (declencheur) declencheur.focus();
    }
    dlg.addEventListener("close", apresFermeture);
    document.addEventListener("click", function (e) {
      var a = e.target.closest("[data-galerie]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
      e.preventDefault();
      ouvrir(a);
    });
    q(".visionneuse-fermer", dlg).addEventListener("click", fermer);
    btnPrec.addEventListener("click", function () { afficher(index - 1); });
    btnSuiv.addEventListener("click", function () { afficher(index + 1); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); afficher(index + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); afficher(index - 1); }
    });
    // Glisser du doigt pour changer de photo ; toucher le fond pour fermer
    var depart = null;
    scene.addEventListener("pointerdown", function (e) {
      depart = (e.target.closest("video, button")) ? null : { x: e.clientX, y: e.clientY };
    });
    scene.addEventListener("pointerup", function (e) {
      if (!depart) return;
      var dx = e.clientX - depart.x, dy = e.clientY - depart.y;
      depart = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { afficher(index + (dx < 0 ? 1 : -1)); return; }
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6 && (e.target === scene || e.target === media)) fermer();
    });
  })();

  /* ---------- Filtres de la page Réalisations ---------- */
  (function () {
    var grille = q("#grille-galerie");
    if (!grille) return;
    var tuiles = qa(".tuile", grille);
    var boutons = qa("[data-filtre]");
    var plus = q("#galerie-plus");
    var statut = q("#galerie-statut");
    var PAS = 24, limite = PAS, filtre = "tout";

    function correspond(t, f) {
      if (f === "tout") return true;
      if (f === "video") return t.getAttribute("data-type") === "video";
      return t.getAttribute("data-cat") === f;
    }
    // Nombre d'éléments par filtre, calculé à partir de la page
    boutons.forEach(function (b) {
      var n = tuiles.filter(function (t) { return correspond(t, b.getAttribute("data-filtre")); }).length;
      var badge = q(".filtre-nombre", b);
      if (badge) badge.textContent = n;
    });
    function appliquer() {
      var total = 0, visibles = 0;
      tuiles.forEach(function (t) {
        if (!correspond(t, filtre)) { t.setAttribute("data-hors-filtre", ""); t.hidden = true; return; }
        t.removeAttribute("data-hors-filtre");
        total++;
        t.hidden = total > limite;
        if (!t.hidden) visibles++;
      });
      var reste = total - visibles;
      plus.hidden = reste <= 0;
      plus.textContent = TXT.plus(Math.min(PAS, reste), reste);
      statut.textContent = total + TXT.statut[filtre];
      boutons.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filtre") === filtre ? "true" : "false"); });
    }
    function choisir(f, majAdresse) {
      if (!TXT.statut[f]) f = "tout";
      filtre = f; limite = PAS; appliquer();
      if (majAdresse) {
        try { history.replaceState(null, "", f === "tout" ? location.pathname + location.search : "#" + f); } catch (err) { /* adresse inchangée */ }
      }
    }
    // Après un changement de filtre, on revient au début de la galerie si on était descendu plus bas
    var section = grille.closest("section");
    function remonter() {
      if (section && section.getBoundingClientRect().top < 0) {
        section.scrollIntoView({ behavior: mouvementReduit() ? "auto" : "smooth", block: "start" });
      }
    }
    boutons.forEach(function (b) { b.addEventListener("click", function () { choisir(b.getAttribute("data-filtre"), true); remonter(); }); });
    plus.addEventListener("click", function () {
      var avant = tuiles.filter(function (t) { return !t.hidden; }).length;
      limite += PAS; appliquer();
      var nouvelle = tuiles.filter(function (t) { return !t.hidden; })[avant];
      if (nouvelle) q("a", nouvelle).focus({ preventScroll: true });
    });
    window.addEventListener("hashchange", function () { choisir(location.hash.slice(1), false); });
    choisir(location.hash.slice(1), false);
  })();

  /* ---------- Avant / après avec curseur ---------- */
  qa(".avap").forEach(function (avap) {
    var curseur = q('input[type="range"]', avap);
    if (!curseur) return;
    function maj() {
      var v = Number(curseur.value);
      avap.style.setProperty("--pos", v + "%");
      curseur.setAttribute("aria-valuetext", TXT.avap(v));
    }
    curseur.addEventListener("input", maj);
    maj();
  });

  /* ---------- Nuancier « Essayez une teinte » ---------- */
  var boutonsTeinte = qa(".ech");
  var scenes = null, active = "salon";
  if (boutonsTeinte.length && q("#scene-salon")) {
    var teintes = boutonsTeinte.map(function (b) {
      return { nom: b.getAttribute("data-nom"), ref: b.getAttribute("data-ref"), hex: b.getAttribute("data-hex") };
    });
    scenes = {
      salon: { svg: q("#scene-salon"), mur: q("#sal-mur"), neuf: q("#sal-mur-neuf"), clip: q("#sal-clip-rect"), rouleau: q("#sal-rouleau"), x0: 0, largeur: 640, yMin: 64, yMax: 196, echelle: 1, teinte: 4, libelle: TXT.interieur },
      facade: { svg: q("#scene-facade"), mur: q("#fac-mur"), neuf: q("#fac-mur-neuf"), clip: q("#fac-clip-rect"), rouleau: q("#fac-rouleau"), x0: 88, largeur: 464, yMin: 150, yMax: 300, echelle: 0.8, teinte: 1, libelle: TXT.facade }
    };
    Object.keys(scenes).forEach(function (k) { scenes[k].cible = scenes[k].mur.getAttribute("fill"); scenes[k].anim = null; });
    var nomChoisi = q("#teinte-nom"), refChoisie = q("#teinte-ref");

    var majChoix = function () {
      var s = scenes[active], t = teintes[s.teinte];
      boutonsTeinte.forEach(function (b, i) { b.setAttribute("aria-pressed", i === s.teinte ? "true" : "false"); });
      nomChoisi.textContent = t.nom;
      refChoisie.textContent = insecable(t.ref);
    };
    var terminer = function (s) {
      if (s.anim) { cancelAnimationFrame(s.anim); s.anim = null; }
      s.mur.setAttribute("fill", s.cible);
      s.clip.setAttribute("width", "0");
      s.rouleau.setAttribute("opacity", "0");
    };
    // Le rouleau traverse le mur de gauche à droite et révèle la nouvelle teinte
    var repeindre = function (s, hex) {
      terminer(s);
      s.cible = hex;
      if (mouvementReduit()) { s.mur.setAttribute("fill", hex); return; }
      s.neuf.setAttribute("fill", hex);
      var manchon = q(".rouleau-manchon", s.rouleau);
      if (manchon) manchon.setAttribute("fill", hex);
      s.rouleau.setAttribute("opacity", "1");
      var duree = 1150, debut = null, course = s.largeur + 70;
      function etape(temps) {
        if (debut === null) debut = temps;
        var p = Math.min(1, (temps - debut) / duree);
        var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        var bord = s.x0 + e * course;
        s.clip.setAttribute("width", Math.max(0, bord - s.x0).toFixed(1));
        var y = s.yMin + (s.yMax - s.yMin) * (0.5 - 0.5 * Math.cos(p * Math.PI * 6));
        s.rouleau.setAttribute("transform", "translate(" + (bord - 46 * s.echelle).toFixed(1) + " " + y.toFixed(1) + ") scale(" + s.echelle + ")");
        if (p < 1) { s.anim = requestAnimationFrame(etape); }
        else { s.anim = null; terminer(s); }
      }
      s.anim = requestAnimationFrame(etape);
    };
    boutonsTeinte.forEach(function (b, i) {
      b.addEventListener("click", function () {
        var s = scenes[active];
        if (s.teinte === i && !s.anim) return;
        s.teinte = i;
        majChoix();
        repeindre(s, teintes[i].hex);
      });
    });
    var bascules = qa("[data-scene]");
    bascules.forEach(function (b) {
      b.addEventListener("click", function () {
        var nom = b.getAttribute("data-scene");
        if (nom === active) return;
        terminer(scenes[active]);
        active = nom;
        bascules.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        Object.keys(scenes).forEach(function (k) {
          if (k === nom) scenes[k].svg.removeAttribute("hidden");
          else scenes[k].svg.setAttribute("hidden", "");
        });
        majChoix();
      });
    });
    majChoix();

    // La teinte choisie passe dans la demande de devis
    var lienTeinte = q("#teinte-devis");
    if (lienTeinte) {
      lienTeinte.addEventListener("click", function () {
        var s = scenes[active], t = teintes[s.teinte];
        var champ = q("#f-teinte");
        if (!champ) return;
        champ.value = t.nom + " (" + t.ref + "), " + s.libelle;
        q("#teinte-ajoutee-couleur").style.background = t.hex;
        q("#teinte-ajoutee-texte").textContent = TXT.teinteAjoutee + t.nom + " (" + insecable(t.ref) + "), " + s.libelle + ".";
        q("#teinte-ajoutee").hidden = false;
        champ.dispatchEvent(new Event("input", { bubbles: true }));
        champ.classList.remove("flash");
        void champ.offsetWidth;
        champ.classList.add("flash");
      });
    }
  }

  /* ---------- Copier un numéro ou une adresse ---------- */
  function copier(texte) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(texte).then(function () { return true; }, function () { return false; });
      }
    } catch (err) { /* copie refusée : on sélectionne le texte à la place */ }
    return Promise.resolve(false);
  }
  qa("[data-copier]").forEach(function (b) {
    var libelle = b.textContent;
    b.addEventListener("click", function () {
      copier(b.getAttribute("data-copier")).then(function (ok) {
        if (!ok) {
          var cible = q("[data-copiable]", b.parentNode);
          if (cible && window.getSelection) {
            var plage = document.createRange();
            plage.selectNodeContents(cible);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(plage);
          }
        }
        b.textContent = ok ? TXT.copie : TXT.selection;
        setTimeout(function () { b.textContent = libelle; }, 1800);
      });
    });
  });

  /* ---------- Demande de devis ---------- */
  var form = q("#form-devis");
  if (form) {
    var btnWa = q("#envoi-whatsapp");
    var btnMail = q("#envoi-email");
    var btnCopie = q("#copier-demande");
    var statut = q("#form-statut");
    var apercu = q("#apercu-demande");
    var valeur = function (id) { var el = q("#" + id); return el ? el.value.trim() : ""; };
    var coches = function (nom) { return qa('input[name="' + nom + '"]:checked', form).map(function (el) { return el.value; }); };
    var dire = function (message) { statut.textContent = message; };

    var texteDemande = function () {
      var l = [TXT.bonjour, ""], c = TXT.champs;
      function ajout(lib, val) { if (val) l.push(lib + TXT.sep + val); }
      ajout(c.nom, valeur("f-nom"));
      ajout(c.tel, valeur("f-tel"));
      ajout(c.ville, valeur("f-ville"));
      ajout(c.bien, coches("bien").join(", "));
      ajout(c.travaux, coches("travaux").join(", "));
      ajout(c.surface, valeur("f-surface"));
      ajout(c.delai, valeur("f-delai"));
      ajout(c.teinte, valeur("f-teinte"));
      var message = valeur("f-message");
      if (message) l.push("", message);
      return l.join("\n");
    };
    var majLiens = function () {
      var t = texteDemande();
      btnWa.setAttribute("href", "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(t));
      btnMail.setAttribute("href", "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent(TXT.sujet) + "&body=" + encodeURIComponent(t));
      if (!apercu.hidden) apercu.value = t;
    };
    var regles = [
      { id: "f-nom", ok: function (v) { return v.length >= 2; } },
      { id: "f-tel", ok: function (v) { return v.replace(/\D/g, "").length >= 9; } },
      { id: "f-ville", ok: function (v) { return v.length >= 2; } }
    ];
    var marquer = function (regle, bon) {
      q("#" + regle.id).setAttribute("aria-invalid", bon ? "false" : "true");
      q("#" + regle.id + "-err").hidden = bon;
    };
    var valider = function () {
      var premier = null;
      regles.forEach(function (r) {
        var bon = r.ok(valeur(r.id));
        marquer(r, bon);
        if (!bon && !premier) premier = q("#" + r.id);
      });
      if (premier) {
        premier.focus();
        dire(TXT.incomplet);
        return false;
      }
      return true;
    };
    regles.forEach(function (r) {
      q("#" + r.id).addEventListener("input", function () {
        if (q("#" + r.id).getAttribute("aria-invalid") === "true" && r.ok(valeur(r.id))) marquer(r, true);
      });
    });

    form.addEventListener("input", majLiens);
    form.addEventListener("change", majLiens);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (valider()) { dire(TXT.pret); btnWa.focus(); }
    });
    btnWa.addEventListener("click", function (e) {
      if (!valider()) { e.preventDefault(); return; }
      majLiens();
      dire(TXT.wa(TXT.telephone));
    });
    btnMail.addEventListener("click", function (e) {
      if (!valider()) { e.preventDefault(); return; }
      majLiens();
      dire(TXT.mail(CONFIG.email));
    });
    btnCopie.addEventListener("click", function () {
      if (!valider()) return;
      var t = texteDemande();
      copier(t).then(function (ok) {
        if (ok) { apercu.hidden = true; dire(TXT.copiee); return; }
        apercu.hidden = false;
        apercu.value = t;
        apercu.focus();
        apercu.select();
        dire(TXT.selectionnee);
      });
    });
    majLiens();
  }
})();
