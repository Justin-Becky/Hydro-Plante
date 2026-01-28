# 🌱 Hydro-plante - Application de Rappel d'Hydratation

Une application web progressive (PWA) gamifiée qui encourage les utilisateurs à boire de l'eau en prenant soin d'une plante virtuelle.

## 📋 Vue d'ensemble

L'utilisateur doit cliquer sur le bouton "Drink Water" pour garder sa plante en bonne santé. Sans interaction :
- **0-30 min** : Plante saine ✅
- **30-60 min** : Légèrement desséchée 🥀
- **60-90 min** : Modérément desséchée 🥀🥀
- **90-120 min** : Très desséchée 🥀🥀🥀
- **120+ min** : Mouante ☠️

## 🎯 Fonctionnalités Principales

### Core Features
- ✅ Affichage dynamique de la plante selon son état d'hydratation
- ✅ Bouton interactif "Drink Water" pour réinitialiser l'état
- ✅ 5 états visuels distincts de la plante
- ✅ Persistence des données (localStorage/IndexedDB)
- ✅ Notifications locales dans le navigateur
- ✅ Notifications push (même quand le site est fermé)
- ✅ Installation sur l'écran d'accueil (PWA)

### Notifications
- **Locales** : Pop-ups dans le navigateur quand l'utilisateur est sur le site
- **Push** : Vraies notifications du système (hors du navigateur) même si l'app est fermée

## 🏗️ Architecture et Structure du Projet

```
hydro-plante/
├── public/
│   ├── manifest.json              # Configuration PWA
│   ├── favicon.ico
│   └── images/
│       ├── plant-healthy.png      # État 1 : Sain
│       ├── plant-dry-1.png        # État 2 : Légèrement desséché
│       ├── plant-dry-2.png        # État 3 : Modérément desséché
│       ├── plant-dry-3.png        # État 4 : Très desséché
│       └── plant-dying.png        # État 5 : Mouant
├── src/
│   ├── components/
│   │   ├── PlantDisplay.vue       # Composant principal : affichage de la plante
│   │   ├── DrinkButton.vue        # Bouton "Drink Water"
│   │   └── Header.vue             # En-tête de l'app
│   ├── services/
│   │   ├── plantService.js        # Logique de gestion de l'état de la plante
│   │   ├── notificationService.js # Notifications locales
│   │   ├── pushService.js         # Notifications push / Service Worker
│   │   └── storageService.js      # Persistence (localStorage/IndexedDB)
│   ├── assets/
│   │   └── styles.css             # Styles globaux
│   ├── App.vue                    # Composant racine
│   ├── main.js                    # Point d'entrée
│   └── registerServiceWorker.js   # Enregistrement du Service Worker
├── sw.js                          # Service Worker (notifications push)
├── package.json
├── vite.config.js
├── index.html
└── .gitignore
```

## 🛠️ Stack Technologique

| Composant | Technologie | Raison |
|-----------|-------------|--------|
| Framework | Vue 3 | Léger, moderne, réactif |
| Build Tool | Vite | Très rapide, hot reload |
| PWA | vite-plugin-pwa / Workbox | Service Worker, manifest |
| Notifications Locales | Notification API (natif) | Intégré au navigateur |
| Notifications Push | Firebase Messaging / Pushjs | Notifications hors navigateur |
| Stockage | localStorage / IndexedDB | Persistence locale |
| Styling | CSS / Tailwind (optionnel) | Responsive design |
| Versioning | Git | Contrôle de code |

## 📅 Plan d'Implémentation

### Phase 1 : Setup & Infrastructure
1. **Initialiser le projet Vue + Vite**
   - `npm create vite@latest hydro-plante -- --template vue`
   - Installer les dépendances
   - Tester le serveur de développement

2. **Configurer la structure des dossiers**
   - Créer tous les répertoires (components, services, assets)
   - Ajouter les fichiers de base

3. **Setup PWA**
   - Installer `vite-plugin-pwa`
   - Créer `manifest.json`
   - Configurer `vite.config.js`

### Phase 2 : Logique Métier
4. **Créer plantService.js**
   - Fonction pour calculer l'état actuel basé sur le temps écoulé
   - États: sain (0-30), desséché1 (30-60), desséché2 (60-90), desséché3 (90-120), mouant (120+)
   - Fonctions: `getPlantState()`, `resetPlant()`, `getTimeUntilNextState()`

5. **Créer storageService.js**
   - Sauvegarder l'heure du dernier "Drink Water"
   - Récupérer l'heure sauvegardée au chargement
   - Nettoyer les données si nécessaire

### Phase 3 : Interface Utilisateur
6. **Créer les composants Vue**
   - `PlantDisplay.vue` : Affiche l'image et l'état actuel
   - `DrinkButton.vue` : Bouton interactif avec feedback
   - `Header.vue` : Titre et infos
   - `App.vue` : Mise en place des composants

7. **Préparer les assets visuels**
   - Sourcer ou créer 5 images de plante (PNG ou SVG)
   - Optimiser les images

8. **Styliser l'application**
   - Design responsive
   - Animations (changements d'état, clic du bouton)
   - Thème (couleurs, typographie)

### Phase 4 : Notifications
9. **Implémenter notificationService.js**
   - Demander la permission à l'utilisateur
   - Envoyer une notification locale chaque fois qu'un seuil est franchi
   - Ou chaque 30 min si la plante est en dessous d'un certain état

10. **Implémenter pushService.js & Service Worker**
    - Créer `sw.js` pour gérer les push notifications
    - Intégrer Firebase Messaging OU Pushjs
    - Gérer l'abonnement push
    - Envoyer des notifications push à intervalles réguliers

### Phase 5 : Polissage & Déploiement
11. **Testing & Optimisation**
    - Tester sur mobile et desktop
    - Vérifier les notifications
    - Optimiser les performances

12. **Déploiement**
    - Build production: `npm run build`
    - Déployer sur Netlify, Vercel, ou un serveur
    - Tester l'installation PWA

## 🔑 Détails Techniques

### Système d'États de la Plante

```javascript
const PLANT_STATES = {
  HEALTHY: { level: 0, name: 'Sain', image: 'plant-healthy.png', maxMinutes: 30 },
  DRY_1: { level: 1, name: 'Légèrement desséché', image: 'plant-dry-1.png', maxMinutes: 60 },
  DRY_2: { level: 2, name: 'Modérément desséché', image: 'plant-dry-2.png', maxMinutes: 90 },
  DRY_3: { level: 3, name: 'Très desséché', image: 'plant-dry-3.png', maxMinutes: 120 },
  DYING: { level: 4, name: 'Mouant', image: 'plant-dying.png', maxMinutes: Infinity }
};
```

### Timeline des Notifications
- **À +30 min** : "Votre plante commence à avoir soif! 💧"
- **À +60 min** : "Votre plante a besoin d'eau! 🥀"
- **À +90 min** : "Urgence! Votre plante se meurt! ☠️"
- **À +120 min** : "Malheureusement, votre plante est morte. 😢"

### Service Worker & Push Notifications
Le Service Worker restera actif même si le navigateur est fermé, permettant de :
- Recevoir des notifications push programmées
- Mettre à jour l'état de la plante en arrière-plan
- Afficher des rappels tous les 30-60 min selon l'état

## 🎨 Considérations de Design

### Images de la Plante
Vous avez 3 options:
1. **Créer les images** : Utiliser Figma, Adobe Illustrator ou similaire
2. **Sourcer des illustrations** : Unsplash, Pexels, Illustration sites
3. **Générer avec CSS/SVG** : Créer des variations SVG programmatiquement

### Animations Recommandées
- ✨ Transition douce quand l'état change
- 💧 Animation du bouton quand on clique
- 📊 Petit contador du temps restant (optionnel)

## 🚀 Prochaines Étapes Recommandées

1. Décider du framework exact (Vue, React, Vanilla JS)?
2. Préparer les 5 images de la plante
3. Choisir le service de notifications push (Firebase vs Pushjs vs autre)?
4. Commencer par la Phase 1 de l'implémentation

## 📚 Ressources Utiles

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Notification API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notification)
- [Service Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Pushjs Library](https://pushjs.org/)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

**Créé le**: 2 janvier 2026  
**Statut**: Planification Complétée ✅
