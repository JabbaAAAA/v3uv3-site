# Récap session — à coller dans la prochaine fenêtre de contexte

## État du projet
- Dossier du projet : `C:\Users\loicm\OneDrive\Desktop\DOSSIER CLAUDE\SITE V3UV3`.
- Dépôt git : `https://github.com/JabbaAAAA/v3uv3-site.git` (branche `main`), poussé et à jour (dernier commit `c126773`).
- Site en ligne : `https://jabbaaaaa.github.io/v3uv3-site/` (GitHub Pages, se reconstruit après chaque push, compter 1-2 min).
- **Consigne permanente de l'utilisateur : après toute modification du site, committer et pousser sur GitHub (`git push origin main`) sans attendre qu'il le redemande.**
- **Pour modifier ce site depuis une autre conversation Claude Code (ex. la conversation du plugin) :**
  soit ouvrir/pointer une session sur ce même dossier (elle aura alors exactement les mêmes
  droits d'édition + push que celle-ci), soit envoyer un message à la session de ce site via
  l'outil SendMessage (nom de session visible dans ListAgents, ex. "Site internet skills et
  optimisation") en décrivant le changement voulu — elle éditera `index.html` et poussera.

## Session en cours (2026-11-12, nettoyage DarkFairyGranullar + transition accueil)
- Le test produit "DarkFairyGranullar" (fiche modale avec tilt 3D/zoom, CSS `.plugfeat`/`.pmodal`,
  JS associé, et les chaînes `pl_m_*`/`pl_new`/`pl_sculpt_*` dans les 8 langues) a été **entièrement
  supprimé** — il ne restait que des vestiges orphelins après le retrait du placeholder honnête
  lors d'une session précédente. Images de test supprimées aussi : `img/plugin-darkfairygranullar.png`,
  `DarfFairyGranullar_4K_transparent.png` (racine). La section `#p-catalog` affiche toujours le
  placeholder honnête "Premiers plugins en préparation".
- Transition écran d'accueil → page de mode accélérée : avant, il fallait attendre la fin complète
  de la vidéo de cassure (`js: vid.addEventListener('ended', ...)`) puis un fondu de 1,7s. Maintenant
  le fondu démarre dès que la vidéo atteint ~55% de sa durée (ou après 1,1s max en filet de sécurité),
  et c'est un fondu+flou rapide de 0,55s (`.landing.leaving{opacity:0;filter:blur(22px)}`) au lieu
  d'une simple opacité lente.
- **Infos Moonbase/Veuve Master reçues de la session plugin ("README.md plugin master",
  2026-11-12) — prêtes à l'emploi, en attente du feu vert utilisateur pour construire la fiche :**
  - **Service :** Moonbase (`moonbase.sh`), plateforme de vente pour plugins audio (encaissement,
    TVA, compte client, téléchargement, licences). Compte vendeur :
    `https://v3uv3-prodution.moonbase.sh` (« prodution » sans C — nom technique du compte, ne pas
    corriger). Produit : `v3uv3-master`. **Compte en mode démo** (faux paiements, pas encore de
    « Go live »). Il faudra ajouter `jabbaaaaa.github.io` aux domaines autorisés côté Moonbase
    (fait par l'utilisateur ou la session plugin, pas ce site).
  - **Intégration technique :** achat intégré via une fenêtre de paiement Moonbase par-dessus le
    site, pas de serveur requis.
    ```html
    <script src="https://assets.moonbase.sh/storefront/moonbase.js"></script>
    <script>Moonbase.setup('https://v3uv3-prodution.moonbase.sh')</script>
    ```
    - Acheter : `Moonbase.purchase({ product_id: 'v3uv3-master', variation_id: 'achat' })`
    - S'abonner : `Moonbase.purchase({ product_id: 'v3uv3-master', variation_id: 'mensuel' })`
    - Essai/Télécharger : `Moonbase.download_product({ product_id: 'v3uv3-master' })` ou lien direct
      `https://v3uv3-prodution.moonbase.sh/download/v3uv3-master` (**vide pour l'instant**, aucun
      installeur envoyé côté Moonbase). Lien de repli pour acheter :
      `https://v3uv3-prodution.moonbase.sh/buy/v3uv3-master`.
    - Non vérifié : les valeurs exactes de `variation_id` (doc Moonbase incomplète) — à tester une
      fois le script en place.
  - **Fiche produit :** nom **V3UV3 MASTER** (l'utilisateur dit « Veuve Master »), marque
    V3UV3 PRODUCTION, accroche « Fait main. Sonne pro. ». Prix : 89 € TTC licence à vie, OU
    abonnement 9 €/mois sans fin (pas de formule annuelle/location-achat). Essai gratuit 14 jours
    sans compte, 2 ordinateurs par licence. Formats : VST3 + AU macOS (11+, Apple Silicon et Intel),
    VST3 Windows 10+ 64 bits — **pas d'AAX** (la FAQ actuelle du site mentionne AAX par erreur,
    réponse `a1`, à corriger en même temps).
    Description courte : « Le plugin de mastering dessiné à la main. Sept modules, un bouton AUTO
    qui vise -14, -9 ou -6 LUFS, une référence à glisser pour copier la couleur d'un son, un
    limiteur true peak. »
    7 modules : Spectral (5 bandes dynamiques déplaçables) · Bus comp (Glue + Detail) ·
    Saturation (Clean/Tube/Tape/Transfo, circuit à diodes modélisé) · Width (+ basses en mono) ·
    Low/Air (+ Sub) · Clipper · Limiteur true peak.
  - **Visuels (hors de ce dossier, côté repo du plugin) :** capture d'interface
    `C:\Users\loicm\v3uv3-master\ui-snapshot.png` (2640×1520) ; croquis original
    `C:\Users\loicm\v3uv3-master\ASSET PLUGIN V3UV3 MASTER .jpg` (portrait, à tourner de 90°).
    Argumentaire de vente déjà rédigé : artefact `https://claude.ai/artifact/GQc2UCDhTEBLGK37G9AZ1i`.
    Récap complet côté plugin : `C:\Users\loicm\v3uv3-master\ETAT-DU-PROJET.md`.
  - **Fait (2026-11-12, commit `2085090`) :** fiche construite dans `#p-catalog` (remplace
    `.plug-soon`), image `img/plugin-master-ui.jpg` (capture d'interface, recompressée depuis
    `C:\Users\loicm\v3uv3-master\ui-snapshot.png`), 7 modules en liste, 2 cartes tarif (89€ à vie /
    9€ mois) avec liens directs Moonbase (`/buy/v3uv3-master`, `/download/v3uv3-master` — mêmes
    URLs que la fiche de référence du projet plugin, pas les appels JS `Moonbase.purchase()` dont
    le `variation_id` n'est pas vérifié), script Moonbase chargé en filet de sécurité (défensif
    comme le chargement GSAP), FAQ `a1` corrigée (plus d'AAX) dans les 8 langues. Vérifié desktop +
    mobile (375px), aucune erreur console propre à ce changement. Session "README.md plugin
    master" prévenue du commit pour tester les boutons en mode démo.
  - **Pas encore fait :** le croquis original (`img/plugin-master-sketch.jpg`, déjà converti et
    redressé, mais pas encore committé/utilisé dans la page) pourrait illustrer "Fait main" si
    l'utilisateur veut l'ajouter.

## Ce qui a été fait lors de la session précédente (2026-11-??, remplacement vidéo + nettoyage)

### 1. Section catalogue plugin — retour en arrière
- Un plugin fictif "DarkFairyGranullar" avait été intégré (fiche produit complète, tilt 3D, zoom, modale) lors d'une session précédente.
- L'utilisateur a demandé de le retirer : remplacé par l'ancien placeholder honnête "Premiers plugins en préparation" (section `#p-catalog`).
- Le CSS/JS de la fiche produit (`.plugfeat`, `.pmodal`, tilt 3D, zoom, modale accessible) avait été
  laissé dans le code à ce moment-là, inutilisé, pour être réactivé pour le prochain vrai plugin —
  **mais la session du 2026-11-12 (voir plus haut) l'a entièrement supprimé** à la demande de
  l'utilisateur, avec les images de test. La fiche produit sera donc reconstruite de zéro pour
  "Veuve Master" plutôt que réactivée.

### 2. Écran d'accueil — remplacement complet
- **Ancien système** : objet "V3" en verre 3D fait avec three.js (`js/intro-glass.js` + `js/vendor/three.module.js`), qui éclatait en grille au clic sur un des 3 boutons de mode (.JPEG/.WAV/.PLUGIN).
- **Tentative abandonnée** : génération IA d'un nouveau logo via MCP Higgsfield (gpt_image_2_6, puis Soul 2.0) — plusieurs directions essayées (verre fracturé, métal brossé + onde sonore + iris d'objectif, Frutiger Aero), aucune validée par l'utilisateur. **Abandonné** quand l'utilisateur a fourni son propre rendu Blender.
- **Solution finale retenue** : l'utilisateur a un vrai logo "V3UV3" (planète/iris + onde audio + bouton play, dégradé violet/cyan, esthétique "PS2 rétro-tech") animé dans Blender en vidéo de cassure (break-apart), rendu en ProRes avec alpha réel.
- Le `<canvas>` three.js est remplacé par une balise `<video>` :
  - `img/landing-break.mp4` — vidéo source Blender (ProRes 4444 alpha) **matée sur le fond exact du site `#0D0C0A`** (pas de transparence vidéo réelle sur le web, pas fiable cross-navigateur), réencodée en H.264, sans son, 4s, ~1,5 Mo.
  - `img/landing-poster.jpg` — frame 1 extraite, sert de poster (logo figé affiché instantanément avant chargement vidéo).
  - Au clic sur un bouton de mode : le mode cible s'affiche immédiatement derrière (comme avant), la vidéo joue sa cassure, puis l'écran d'accueil disparaît en fondu à la fin de la vidéo (`ended` event). Respecte `prefers-reduced-motion` (saute direct au mode choisi).
- **Remplacée une 2e fois en cours de session** par une version HD fournie par l'utilisateur (`logo_destruction_hd_v1.mov`), même pipeline, fichiers web écrasés aux mêmes chemins (aucun changement HTML/CSS nécessaire).
- Un halo décoratif CSS orange/teal (`.landing__mark::before`, résidu de l'ancienne charte couleur) a été supprimé à la demande de l'utilisateur — il causait la confusion "halo bleu/orange" qu'il attribuait à tort au fichier vidéo (le fichier vidéo était correct, alpha réel confirmé via `ffprobe`).
- `js/intro-glass.js` et `js/vendor/three.module.js` supprimés (plus aucune référence dans le projet).
- `img/landing-mark.png` (ancien PNG statique du logo) n'est plus référencé nulle part mais pas supprimé — en attente de décision utilisateur.

### 3. Environnement technique
- Passage Mac → Windows en cours de session (le projet est maintenant sur `C:\Users\loicm\OneDrive\Desktop\DOSSIER CLAUDE\SITE V3UV3`, `Is a git repository: true`).
- `.claude/launch.json` corrigé : `python3` (introuvable sur Windows, alias cassé du Store) remplacé par `py -3` pour que le serveur de preview locale démarre.
- `ffmpeg` et `ffprobe` confirmés disponibles sur la machine (utilisés pour toutes les conversions vidéo).

## En attente côté utilisateur
- Décider du sort de `img/landing-mark.png` (plus référencé, pas supprimé). Les fichiers
  DarkFairyGranullar orphelins, eux, sont déjà supprimés (voir session du 2026-11-12 ci-dessus).
- Préciser le service de vente/livraison du plugin "Veuve Master" (appelé "Moonbase" par
  l'utilisateur, nom non identifié tel quel — Lemonsqueezy/Gumroad/Payhip/autre à confirmer) et
  fournir les assets (image, description, formats, prix/lien).
- Items déjà en attente avant cette session (voir `CLAUDE.md`) : fichiers audio manquants (`audio/*.mp3`), choix du bon compte Instagram, export `og-image.png`, mentions légales/confidentialité à compléter, domaine/hébergeur custom (actuellement sur GitHub Pages par défaut).

## Fichiers clés à relire en priorité dans la prochaine session
- `index.html` (tout le site)
- `CLAUDE.md` (contexte projet, à mettre à jour avec cette session si besoin)
- `DESIGN.md` (charte — pas encore mise à jour avec la nouvelle identité visuelle violet/cyan du logo Blender, à faire si on continue dans cette direction)
