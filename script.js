/**
 * Hydro-Plante — Logique d'état, timer, notifications, série et styles de plante.
 * Compatible GitHub Pages, mobile et PC, sans dépendances.
 */

(function () {
  "use strict";

  // --- Constantes (seuils en heures) ---
  var THRESHOLD_WILTED_H = 0.5;
  var THRESHOLD_DEAD_H   = 1;
  var NOTIFY_AFTER_H     = 1000;
  var NOTIFY_COOLDOWN_MS = 30 * 60 * 1000000;
  var TICK_MS            = 60 * 1000;
  var TIMER_UPDATE_MS    = 1000;

  // --- GitHub API ---
  var GITHUB_TOKEN = "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";
  var GITHUB_REPO  = "Justin-Becky/Hydro-Plante";
  var GITHUB_FILE  = "plant_state.json";

  // --- Clés localStorage ---
  var STORAGE_KEY          = "hydroPlante_lastWatering";
  var NOTIFY_LAST_KEY      = "hydroPlante_lastNotify";
  var DRINK_COUNT_KEY      = "hydroPlante_drinkCount";
  var DRINK_DATE_KEY       = "hydroPlante_drinkDate";
  var PENDING_SYNC_KEY     = "hydroPlante_pendingSync";
  var STREAK_KEY           = "hydroPlante_streak";
  var STREAK_DATE_KEY      = "hydroPlante_streakDate";
  var STREAK_BEST_KEY      = "hydroPlante_bestStreak";
  var DIED_TODAY_KEY       = "hydroPlante_diedToday";
  var STYLE_KEY            = "hydroPlante_selectedStyle";     // style sélectionné
  var UNLOCKED_STYLES_KEY  = "hydroPlante_unlockedStyles";   // styles débloqués (permanent)

  // ════════════════════════════════════════════════════════════════════
  //  STYLES DE PLANTE
  //
  //  unlockStreak : 0 = toujours disponible
  //                 7 = débloqué après 7 jours de série
  //
  //  Chaque style a 3 états : normal / wilted (fanée) / dead (morte)
  //
  //  Pour ajouter vos images fanée/morte aux nouveaux styles :
  //   1. Copiez le fichier dans images/
  //   2. Remplacez le chemin ci-dessous (ex. "images/fanee_normale_1.png")
  //
  //  Si une image n'existe pas encore → fallback automatique sur le style "normale"
  // ════════════════════════════════════════════════════════════════════
  //  STYLES DE PLANTE — les images fanée et morte sont les mêmes pour tous
  //
  //  Stade 0 :  toujours dispo    → normale
  //  Stade 1 :  7  jours de série → normale_1 + fantastique_1
  //  Stade 2 :  14 jours de série → normale_2 + fantastique_2
  // ════════════════════════════════════════════════════════════════════
  var PLANT_STYLES = {
    normale: {
      unlockStreak: 0,
      label: "Normale",
      normal: "images/normale.png",
      wilted: "images/fannée.png",
      dead:   "images/morte.png"
    },
    normale_1: {
      unlockStreak: 7,
      label: "Normale 1",
      normal: "images/normale_1.png",
      wilted: "images/fannée.png",
      dead:   "images/morte.png"
    },
    fantastique_1: {
      unlockStreak: 21,
      label: "Fantastique 1",
      normal: "images/fantastique_1.png",
      wilted: "images/fannée.png",
      dead:   "images/morte.png"
    },
    normale_2: {
      unlockStreak: 14,
      label: "Normale 2",
      normal: "images/normale_2.png",
      wilted: "images/fannée.png",
      dead:   "images/morte.png"
    },
    fantastique_2: {
      unlockStreak: 28,
      label: "Fantastique 2",
      normal: "images/fantastique_2.png",
      wilted: "images/fannée.png",
      dead:   "images/morte.png"
    }
  };
  // ════════════════════════════════════════════════════════════════════

  var labelByState = {
    normal: "La plante va bien !",
    wilted: "La plante a soif… Pense à boire !",
    dead:   "La plante est morte. Arrose-la pour la revigorer."
  };

  // État courant de la plante (pour le fallback d'image et les boutons de style)
  var currentPlantState = 'normal';

  // --- Éléments DOM ---
  var plantArea      = document.getElementById("plantArea");
  var plantEmoji     = document.getElementById("plantEmoji");
  var plantStatus    = document.getElementById("plantStatus");
  var waterBtn       = document.getElementById("waterBtn");
  var timerHours     = document.getElementById("timerHours");
  var timerMinutes   = document.getElementById("timerMinutes");
  var timerContainer = document.querySelector(".timer-container");

  // ─── Utilitaires date ────────────────────────────────────────────────────────

  function getTodayString() {
    var d = new Date();
    return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
  }

  function getYesterdayString() {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
  }

  // ─── Compteur de verres ──────────────────────────────────────────────────────

  function getDrinkCount() {
    if (localStorage.getItem(DRINK_DATE_KEY) !== getTodayString()) {
      localStorage.setItem(DRINK_DATE_KEY, getTodayString());
      localStorage.setItem(DRINK_COUNT_KEY, '0');
    }
    return parseInt(localStorage.getItem(DRINK_COUNT_KEY) || '0', 10);
  }

  function incrementDrinkCount() {
    var count = getDrinkCount() + 1;
    localStorage.setItem(DRINK_COUNT_KEY, count.toString());
    localStorage.setItem(DRINK_DATE_KEY, getTodayString());
    renderDrinkCounter(count);
  }

  function renderDrinkCounter(count) {
    var countEl = document.getElementById('drinkCount');
    var dotsEl  = document.getElementById('drinkDots');
    if (countEl) countEl.textContent = count;
    if (!dotsEl) return;
    var html = '';
    for (var i = 0; i < Math.min(count, 8); i++) {
      html += '<span class="drink-dot"></span>';
    }
    if (count > 8) {
      html += '<span class="drink-dot-extra">+' + (count - 8) + '</span>';
    }
    dotsEl.innerHTML = html;
  }

  // ─── Styles de plante ────────────────────────────────────────────────────────

  /** Retourne l'id du style sélectionné (vérifie qu'il existe toujours). */
  function getSelectedStyle() {
    var id = localStorage.getItem(STYLE_KEY) || 'normale';
    return PLANT_STYLES[id] ? id : 'normale';
  }

  /** Enregistre le style choisi. */
  function setSelectedStyle(id) {
    if (PLANT_STYLES[id]) localStorage.setItem(STYLE_KEY, id);
  }

  /** Retourne la liste des styles définitivement débloqués. */
  function getUnlockedStyles() {
    try {
      var raw = localStorage.getItem(UNLOCKED_STYLES_KEY);
      return raw ? JSON.parse(raw) : ['normale'];
    } catch (e) { return ['normale']; }
  }


  /**
   * Vérifie si de nouveaux styles sont débloqués par la série actuelle.
   * Les déblocages sont permanents (restent même si la série retombe).
   * Retourne true si un nouveau style vient d'être débloqué.
   */
  function checkAndUnlockStyles(streak) {
    var unlocked = getUnlockedStyles();
    var changed  = false;
    for (var id in PLANT_STYLES) {
      var threshold = PLANT_STYLES[id].unlockStreak;
      if (threshold > 0 && streak >= threshold && unlocked.indexOf(id) === -1) {
        unlocked.push(id);
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(UNLOCKED_STYLES_KEY, JSON.stringify(unlocked));
    }
    return changed;
  }

  // ─── Menu d'évolution ────────────────────────────────────────────────────────

  var evoMenuOpen = false;

  /** Initialise le bouton déclencheur (appelé une seule fois à l'init). */
  function initEvoPicker() {
    var trigger = document.getElementById('evoTrigger');
    if (!trigger) return;

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (evoMenuOpen) {
        closeEvoMenu();
      } else {
        openEvoMenu();
      }
    });

    // Fermer le menu quand on clique ailleurs
    document.addEventListener('click', function () {
      if (evoMenuOpen) closeEvoMenu();
    });
  }

  function openEvoMenu() {
    buildEvoMenuContent();
    var menu = document.getElementById('evoMenu');
    if (menu) menu.classList.add('open');
    var trigger = document.getElementById('evoTrigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    evoMenuOpen = true;
  }

  function closeEvoMenu() {
    var menu = document.getElementById('evoMenu');
    if (menu) menu.classList.remove('open');
    var trigger = document.getElementById('evoTrigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    evoMenuOpen = false;
  }

  /** Construit le contenu HTML du menu selon les styles débloqués. */
  function buildEvoMenuContent() {
    var menu = document.getElementById('evoMenu');
    if (!menu) return;

    var unlocked = getUnlockedStyles();
    var selected = getSelectedStyle();
    var html     = '';

    // Vérifier si des styles extra sont débloqués
    var hasExtra = false;
    for (var i = 0; i < unlocked.length; i++) {
      if (unlocked[i] !== 'normale') { hasExtra = true; break; }
    }

    if (!hasExtra) {
      // Trouver le prochain seuil de déblocage
      var next = null;
      for (var id in PLANT_STYLES) {
        var t = PLANT_STYLES[id].unlockStreak;
        if (t > 0 && (next === null || t < next)) next = t;
      }
      html = '<p class="evo-menu-empty">Aucune évolution disponible.<br>' +
             'Continue jusqu\'à ' + next + ' jours de série 🔥</p>';
    } else {
      html = '<p class="evo-menu-title">Choisir un style</p>' +
             '<div class="evo-items-grid">';
      for (var styleId in PLANT_STYLES) {
        var style    = PLANT_STYLES[styleId];
        var isActive = styleId === selected;
        var isLocked = unlocked.indexOf(styleId) === -1;
        var cls      = 'evo-item' +
                       (isActive  ? ' evo-item--active'  : '') +
                       (isLocked  ? ' evo-item--locked'  : '');
        var badge    = isActive ? '<span class="evo-item-badge">✓</span>' : '';
        var lock     = isLocked ? '<span class="evo-item-lock">🔒</span>'  : '';
        var meta     = isLocked
          ? '<span class="evo-item-meta">' + style.unlockStreak + ' j</span>'
          : '';
        var disabled = isLocked ? ' disabled' : '';
        html += '<button type="button" class="' + cls + '"' + disabled +
                ' data-style="' + styleId + '">' +
                '<div class="evo-item-thumb-wrap">' +
                  '<img class="evo-item-thumb" src="' + style.normal +
                       '" alt="' + style.label + '" loading="lazy">' +
                  badge + lock +
                '</div>' +
                '<span class="evo-item-label">' + style.label + '</span>' +
                meta +
                '</button>';
      }
      html += '</div>';
    }

    menu.innerHTML = html;

    // Attacher les handlers aux items déverrouillés
    var items = menu.querySelectorAll('.evo-item:not(.evo-item--locked)');
    for (var j = 0; j < items.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          setSelectedStyle(btn.getAttribute('data-style'));
          renderPlant(currentPlantState);
          closeEvoMenu();
          renderEvoPicker();
        });
      })(items[j]);
    }
  }

  /** Met à jour le bouton déclencheur (icône et label). */
  function renderEvoPicker() {
    var trigger = document.getElementById('evoTrigger');
    var label   = document.getElementById('evoTriggerLabel');
    if (!trigger) return;

    var unlocked = getUnlockedStyles();
    var hasExtra = false;
    for (var i = 0; i < unlocked.length; i++) {
      if (unlocked[i] !== 'normale') { hasExtra = true; break; }
    }

    if (hasExtra) {
      trigger.classList.add('has-evolutions');
      if (label) label.textContent = PLANT_STYLES[getSelectedStyle()].label;
    } else {
      trigger.classList.remove('has-evolutions');
      if (label) label.textContent = 'Aucune évolution';
    }

    // Si le menu est ouvert, reconstruire son contenu
    if (evoMenuOpen) buildEvoMenuContent();
  }

  // ─── Série (streak) ──────────────────────────────────────────────────────────

  function getStreak() {
    return parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
  }

  function getBestStreak() {
    return parseInt(localStorage.getItem(STREAK_BEST_KEY) || '0', 10);
  }

  function setStreak(value) {
    localStorage.setItem(STREAK_KEY, value.toString());
    if (value > getBestStreak()) {
      localStorage.setItem(STREAK_BEST_KEY, value.toString());
    }
    // Vérifier si de nouveaux styles sont débloqués
    var newUnlock = checkAndUnlockStyles(value);
    renderStreak(value);
    renderEvoPicker();
    // Petite animation sur le badge si déblocage
    if (newUnlock) animateUnlock();
  }

  function renderStreak(streak) {
    var el = document.getElementById('streakValue');
    if (el) el.textContent = streak;
  }

  /** Animation discrète sur le badge série lors d'un nouveau déblocage. */
  function animateUnlock() {
    var counter = document.getElementById('streakCounter');
    if (!counter) return;
    counter.classList.add('unlocked');
    setTimeout(function () { counter.classList.remove('unlocked'); }, 1200);
  }

  function checkStreakOnStartup() {
    var streakDate = localStorage.getItem(STREAK_DATE_KEY);
    var today      = getTodayString();
    var yesterday  = getYesterdayString();
    if (!streakDate) return;

    if (streakDate !== today && streakDate !== yesterday) {
      setStreak(0);
      return;
    }

    var last = getLastWatering();
    if (last === null || (Date.now() - last) > 24 * 60 * 60 * 1000) {
      setStreak(0);
    }
  }

  function onPlantDied() {
    var today = getTodayString();
    if (localStorage.getItem(DIED_TODAY_KEY) === today) return;
    localStorage.setItem(DIED_TODAY_KEY, today);
    setStreak(0);
  }

  function onMidnight() {
    renderDrinkCounter(getDrinkCount());
    var yesterday = getYesterdayString();
    var diedDate  = localStorage.getItem(DIED_TODAY_KEY);
    if (diedDate !== yesterday) {
      var newStreak = getStreak() + 1;
      localStorage.setItem(STREAK_DATE_KEY, yesterday);
      setStreak(newStreak);
    }
  }

  function scheduleNextMidnightReset() {
    var now      = new Date();
    var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    setTimeout(function () {
      onMidnight();
      scheduleNextMidnightReset();
    }, tomorrow - now);
  }

  // ─── État de la plante ───────────────────────────────────────────────────────

  function getLastWatering() {
    var raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseInt(raw, 10) : null;
  }

  function setLastWatering() {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  function getPlantState(elapsedHours) {
    if (elapsedHours === null) return "normal";
    if (elapsedHours < THRESHOLD_WILTED_H) return "normal";
    if (elapsedHours < THRESHOLD_DEAD_H)   return "wilted";
    return "dead";
  }

  /**
   * Met à jour l'affichage de la plante avec le style choisi.
   * Fallback automatique vers "normale" si l'image n'existe pas.
   */
  function renderPlant(state) {
    currentPlantState = state;

    var styleId    = getSelectedStyle();
    var style      = PLANT_STYLES[styleId];
    var fallback   = PLANT_STYLES.normale;
    var src        = style[state] || fallback[state];

    // Fallback si l'image ne se charge pas (fanée/morte pas encore ajoutées)
    plantEmoji.onerror = function () {
      plantEmoji.onerror = null; // éviter la boucle infinie
      plantEmoji.src = fallback[state] || fallback.normal;
    };
    plantEmoji.src          = src;
    plantStatus.textContent = labelByState[state];
    plantArea.className     = "plant-area " + state;
  }

  // ─── Timer ───────────────────────────────────────────────────────────────────

  function updateTimer(elapsedMs) {
    if (!timerHours || !timerMinutes || !timerContainer) return;

    if (elapsedMs === null) {
      timerHours.textContent   = "∞";
      timerMinutes.textContent = "";
      timerContainer.className = "timer-container danger";
      return;
    }

    var totalMinutes = Math.floor(elapsedMs / (60 * 1000));
    var hours        = Math.floor(totalMinutes / 60);
    var minutes      = totalMinutes % 60;

    if (timerHours.textContent !== hours.toString()) {
      timerHours.style.animation = "none";
      setTimeout(function () { timerHours.style.animation = ""; }, 10);
    }

    timerHours.textContent   = hours;
    timerMinutes.textContent = minutes.toString().padStart(2, "0");

    var elapsedHours = elapsedMs / (60 * 60 * 1000);
    if (elapsedHours >= THRESHOLD_DEAD_H) {
      timerContainer.className = "timer-container danger";
    } else if (elapsedHours >= THRESHOLD_WILTED_H) {
      timerContainer.className = "timer-container warning";
    } else {
      timerContainer.className = "timer-container";
    }
  }

  // ─── Notifications ───────────────────────────────────────────────────────────

  function maybeSendNotification(elapsedHours) {
    if (elapsedHours === null || elapsedHours < NOTIFY_AFTER_H) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    var lastNotify = localStorage.getItem(NOTIFY_LAST_KEY);
    var now        = Date.now();
    if (lastNotify && now - parseInt(lastNotify, 10) < NOTIFY_COOLDOWN_MS) return;

    try {
      new Notification("Hydro-Plante", {
        body: "N'oublie pas de boire de l'eau ! Arrose ta plante 🌱",
        icon: null
      });
      localStorage.setItem(NOTIFY_LAST_KEY, now.toString());
    } catch (e) { /* non supporté */ }
  }

  function requestNotificationPermission() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") Notification.requestPermission();
  }

  // ─── Tick principal ──────────────────────────────────────────────────────────

  function tick() {
    var last         = getLastWatering();
    var elapsedMs    = last ? (Date.now() - last) : null;
    var elapsedHours = elapsedMs ? elapsedMs / (60 * 60 * 1000) : null;

    var state = getPlantState(elapsedHours);
    if (state === 'dead') onPlantDied();

    renderPlant(state);
    updateTimer(elapsedMs);
    maybeSendNotification(elapsedHours);
  }

  function tickTimer() {
    var last      = getLastWatering();
    var elapsedMs = last ? (Date.now() - last) : null;
    updateTimer(elapsedMs);
  }

  // ─── GitHub sync ─────────────────────────────────────────────────────────────

  function updatePlantStateOnGitHub() {
    if (!navigator.onLine) {
      localStorage.setItem(PENDING_SYNC_KEY, 'true');
      return;
    }

    var apiUrl  = "https://api.github.com/repos/" + GITHUB_REPO + "/contents/" + GITHUB_FILE;
    var headers = {
      "Authorization": "token " + GITHUB_TOKEN,
      "Accept": "application/vnd.github.v3+json"
    };

    fetch(apiUrl, { headers: headers })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var newState = {
          last_watering: new Date().toISOString(),
          last_notification: null
        };
        var newContent = btoa(JSON.stringify(newState, null, 2));
        return fetch(apiUrl, {
          method: "PUT",
          headers: Object.assign({ "Content-Type": "application/json" }, headers),
          body: JSON.stringify({
            message: "Arrosage de la plante [web]",
            content: newContent,
            sha: data.sha
          })
        });
      })
      .then(function (res) {
        if (res.ok) {
          localStorage.removeItem(PENDING_SYNC_KEY);
        } else {
          console.error("❌ Erreur mise à jour GitHub:", res.status);
        }
      })
      .catch(function (err) {
        console.error("❌ Erreur réseau:", err);
        localStorage.setItem(PENDING_SYNC_KEY, 'true');
      });
  }

  window.addEventListener('online', function () {
    if (localStorage.getItem(PENDING_SYNC_KEY) === 'true') {
      updatePlantStateOnGitHub();
    }
  });

  // ─── Action arrosage ─────────────────────────────────────────────────────────

  function onWaterClick() {
    setLastWatering();
    tick();
    requestNotificationPermission();
    updatePlantStateOnGitHub();
    incrementDrinkCount();

    waterBtn.style.transform = "scale(0.95)";
    setTimeout(function () { waterBtn.style.transform = ""; }, 200);
  }

  // ─── Enregistrement du Service Worker ────────────────────────────────────────

  if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) {
        console.warn('SW non enregistré :', err);
      });
    });
  }

  // ─── Initialisation ──────────────────────────────────────────────────────────

  if (waterBtn) waterBtn.addEventListener("click", onWaterClick);

  checkStreakOnStartup();

  // Initialiser le menu d'évolution
  initEvoPicker();

  // Premier affichage
  tick();

  // Initialiser le compteur de verres (sans animation au démarrage)
  var drinkDotsEl = document.getElementById('drinkDots');
  if (drinkDotsEl) drinkDotsEl.classList.add('no-anim');
  renderDrinkCounter(getDrinkCount());
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      if (drinkDotsEl) drinkDotsEl.classList.remove('no-anim');
    });
  });

  renderStreak(getStreak());
  renderEvoPicker();

  scheduleNextMidnightReset();
  setInterval(tick, TICK_MS);
  setInterval(tickTimer, TIMER_UPDATE_MS);
})();
