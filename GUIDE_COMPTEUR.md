# 🕐 Ajout du Compteur de Temps

## Ce qui a changé

J'ai ajouté un **compteur visuel** qui affiche depuis combien de temps ta copine n'a pas bu d'eau.

### Fonctionnalités :
- ⏱️ Affiche le temps en **heures et minutes**
- 🟢 **Vert** quand tout va bien (0-2h)
- 🟡 **Jaune/doré** quand la plante fane (2-4h)
- 🔴 **Brun/rouge** quand la plante est morte (4h+)
- ✨ **Animation pulsante** quand le temps augmente
- 🔄 Se remet à **0h00min** quand elle clique "Arroser la plante"
- 📱 **Responsive** : s'adapte à tous les écrans

## 🚀 Installation

### Remplace 3 fichiers sur GitHub :

1. **index.html** → Remplace par `index_with_timer.html`
2. **style.css** → Remplace par `style_with_timer.css`  
3. **script.js** → Remplace par `script_with_timer.js`

### Méthode rapide (via GitHub web) :

1. Va sur ton repo `Justin-Becky/Hydro-Plante`
2. Pour chaque fichier :
   - Clique sur le fichier (ex: `index.html`)
   - Clique sur l'icône ✏️ (Edit)
   - Remplace tout le contenu par celui du nouveau fichier
   - Commit les changements

### Méthode via Git :

```bash
# Si tu as les nouveaux fichiers téléchargés
cp index_with_timer.html index.html
cp style_with_timer.css style.css
cp script_with_timer.js script.js

git add index.html style.css script.js
git commit -m "Add time counter since last hydration"
git push
```

## 🎨 Aperçu du résultat

```
┌─────────────────────────────┐
│      Hydro-Plante          │
├─────────────────────────────┤
│                             │
│  Dernière hydratation       │
│       2h 45min              │  ← NOUVEAU COMPTEUR
│     (en vert/jaune/rouge)   │
│                             │
│        🌱 [Plante]          │
│   La plante a soif...       │
│                             │
│   [Arroser la plante]       │
│                             │
└─────────────────────────────┘
```

## ⚙️ Personnalisation

### Changer les couleurs du compteur

Dans `style_with_timer.css`, cherche :

```css
.timer-display {
  color: var(--color-primary);  /* Vert normal */
}

.timer-container.warning .timer-display {
  color: var(--color-wilted);   /* Jaune/doré */
}

.timer-container.danger .timer-display {
  color: var(--color-dead);     /* Brun/rouge */
}
```

### Changer les seuils de couleur

Dans `script_with_timer.js`, ligne ~112 :

```javascript
if (elapsedHours >= THRESHOLD_DEAD_H) {      // 4h+ → rouge
  timerContainer.className = "timer-container danger";
} else if (elapsedHours >= THRESHOLD_WILTED_H) {  // 2h+ → jaune
  timerContainer.className = "timer-container warning";
} else {                                     // 0-2h → vert
  timerContainer.className = "timer-container";
}
```

### Changer la taille du compteur

Dans `style_with_timer.css`, ligne ~88 :

```css
.timer-display {
  font-size: clamp(2rem, 8vw, 3rem);  /* Change les valeurs ici */
}
```

## 🧪 Tester

1. Ouvre le site sur ton téléphone
2. Le compteur devrait afficher le temps écoulé
3. Clique sur "Arroser la plante"
4. Le compteur se remet à **0h00min** et devient **vert**
5. Attends quelques minutes → le compteur s'incrémente automatiquement

## ✅ Avantages

- **Visuel immédiat** : ta copine voit en un coup d'œil depuis combien de temps elle n'a pas bu
- **Motivant** : elle voudra remettre le compteur à zéro
- **Gamification** : transformer l'hydratation en jeu
- **Pas de confusion** : le temps est clairement affiché

## 📱 Comportement mobile

- Le compteur se met à jour **automatiquement chaque seconde**
- Fonctionne même quand l'app est en arrière-plan (si la page reste ouverte)
- S'adapte aux petits écrans (responsive)

---

Enjoy ! 💚🌱
