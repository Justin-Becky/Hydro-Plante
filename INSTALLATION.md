# ⚠️ Installation Requise - Node.js et npm

Pour lancer l'application Hydro-plante, vous avez besoin d'installer **Node.js** (qui inclut npm).

## Étapes d'installation

### 1. Télécharger Node.js

Allez sur [https://nodejs.org/](https://nodejs.org/) et téléchargez:
- **LTS (Long Term Support)** pour une stabilité maximale
- Ou la dernière version stable

### 2. Installer Node.js

- Lancez le fichier `.msi` téléchargé
- Suivez l'assistant d'installation
- Acceptez les paramètres par défaut (cela installera aussi npm)
- Redémarrez votre ordinateur

### 3. Vérifier l'installation

Ouvrez un terminal (PowerShell ou Command Prompt) et tapez:

```bash
node --version
npm --version
```

Vous devriez voir les numéros de version s'afficher.

### 4. Lancer l'application

Une fois Node.js installé:

```bash
cd c:\Users\justi\Hydro-plante
npm install
npm run dev
```

## Alternatives

Si vous ne voulez pas installer Node.js localement, vous pouvez:

1. **Utiliser StackBlitz** (en ligne)
   - Créez un projet Vue 3 + Vite
   - Copiez le code des fichiers

2. **Utiliser Docker**
   - Voir le fichier `Dockerfile` (à venir)

3. **Déployer directement sur Netlify**
   - Connectez votre repo GitHub
   - Netlify installera les dépendances automatiquement

---

Une fois Node.js installé, revenez à ce répertoire et exécutez `npm install && npm run dev` ! 🚀
