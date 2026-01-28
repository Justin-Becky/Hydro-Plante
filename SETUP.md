# 🌱 Hydro-plante - Installation et Lancement

## Installation des dépendances

```bash
npm install
```

ou avec pnpm:

```bash
pnpm install
```

## Lancement en développement

```bash
npm run dev
```

L'application sera disponible à `http://localhost:5173`

## Build pour la production

```bash
npm run build
```

Les fichiers compilés seront dans le dossier `dist/`

## Aperçu de la production

```bash
npm run preview
```

## Structure des fichiers

```
src/
├── components/
│   ├── Header.vue          # En-tête de l'application
│   ├── PlantDisplay.vue    # Affichage de la plante et ses infos
│   └── DrinkButton.vue     # Bouton "Drink Water"
├── services/
│   ├── plantService.js     # Logique de gestion de l'état de la plante
│   ├── storageService.js   # Gestion du stockage local
│   ├── notificationService.js  # Notifications navigateur
│   └── pushService.js      # Notifications push et Service Worker
├── assets/
│   └── styles.css          # Styles globaux
├── App.vue                 # Composant racine
└── main.js                 # Point d'entrée

public/
├── manifest.json           # Configuration PWA
├── sw.js                   # Service Worker
└── robots.txt              # Configuration SEO
```

## Fonctionnalités

✅ **Système de progression** - La plante change d'état tous les 30 minutes
✅ **Notifications locales** - Rappels quand vous êtes sur le site
✅ **Notifications push** - Rappels même quand le site est fermé
✅ **PWA** - Installez l'app sur votre écran d'accueil
✅ **Offline-ready** - Fonctionne partiellement hors ligne
✅ **Statistiques** - Suivi du nombre de verres d'eau bu
✅ **Responsive** - Fonctionne sur mobile et desktop

## Configuration

### Pour les notifications push en production

Pour les vraies notifications push (hors du navigateur), vous aurez besoin de:

1. **Firebase Cloud Messaging** ou un autre service
2. Un **serveur backend** pour envoyer les notifications
3. Configuration des **clés d'accès** Firebase

Pour maintenant, les notifications locales et push de base fonctionnent.

## Déploiement

### Netlify

```bash
npm run build
# Déployer le dossier 'dist/' sur Netlify
```

### Vercel

```bash
npm run build
# Déployer avec `vercel`
```

### Serveur personnalisé

Votre serveur doit:
1. Servir les fichiers statiques du dossier `dist/`
2. Rediriger les routes non-fichiers vers `index.html` (pour Vue Router)
3. Supporter HTTPS (requis pour les notifications push)

## Dépannage

### Les notifications ne fonctionnent pas
- Vérifiez que vous avez accordé la permission
- Vérifiez que le site utilise HTTPS (si en production)
- Vérifiez la console du navigateur pour les erreurs

### L'app ne s'installe pas
- Assurez-vous que le site est en HTTPS
- Vérifiez que `manifest.json` est valide
- Vérifiez que le Service Worker s'est enregistré

### Performance

L'app est optimisée pour être légère. Si vous avez des problèmes:

```bash
npm run build
# Vérifiez la taille du bundle
```

## Support

Pour les problèmes ou les suggestions, créez une issue!

---

Fait avec 💚 pour votre hydratation
