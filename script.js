/**
 * Hydro-Plante — Logique d'état, timer et notifications
 * Compatible GitHub Pages, mobile et PC, sans dépendances.
 * Avec compteur de temps depuis la dernière hydratation.
 */

(function () {
  "use strict";

  // --- Constantes (seuils en heures) ---
  var THRESHOLD_WILTED_H = 2;   // après 2h sans eau → fanée
  var THRESHOLD_DEAD_H = 4;     // après 4h sans eau → morte
  var NOTIFY_AFTER_H = 1;       // envoyer une notification après 1h sans arrosage
  var NOTIFY_COOLDOWN_MS = 30 * 60 * 1000; // pas plus d'une notif toutes les 30 min
  var TICK_MS = 60 * 1000;      // recalcul toutes les minutes
  var TIMER_UPDATE_MS = 1000;   // mise à jour du compteur chaque seconde

  var STORAGE_KEY = "hydroPlante_lastWatering";
  var NOTIFY_LAST_KEY = "hydroPlante_lastNotify";

  var plantArea = document.getElementById("plantArea");
  var plantEmoji = document.getElementById("plantEmoji");
  var plantStatus = document.getElementById("plantStatus");
  var waterBtn = document.getElementById("waterBtn");
  
  // Éléments du compteur
  var timerDisplay = document.getElementById("timerDisplay");
  var timerHours = document.getElementById("timerHours");
  var timerMinutes = document.getElementById("timerMinutes");
  var timerContainer = document.querySelector(".timer-container");

  var imageByState = {
    normal: "images/normale.png",
    wilted: "images/fannée.png",
    dead: "images/morte.png"
  };
  
  var labelByState = {
    normal: "La plante va bien !",
    wilted: "La plante a soif… Pense à boire !",
    dead: "La plante est morte. Arrose-la pour la revigorer."
  };

  /**
   * Retourne le timestamp du dernier arrosage (ou null).
   */
  function getLastWatering() {
    var raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseInt(raw, 10) : null;
  }

  /**
   * Enregistre l'heure actuelle comme dernier arrosage.
   */
  function setLastWatering() {
    var now = Date.now();
    localStorage.setItem(STORAGE_KEY, now.toString());
  }

  /**
   * Calcule l'état de la plante à partir du temps écoulé (en heures).
   * @param {number|null} elapsedHours - heures depuis le dernier arrosage (null = jamais arrosé)
   * @returns {'normal'|'wilted'|'dead'}
   */
  function getPlantState(elapsedHours) {
    if (elapsedHours === null) return "wilted";
    if (elapsedHours < THRESHOLD_WILTED_H) return "normal";
    if (elapsedHours < THRESHOLD_DEAD_H) return "wilted";
    return "dead";
  }

  /**
   * Met à jour l'affichage de la plante (emoji, texte, classes).
   */
  function renderPlant(state) {
    plantEmoji.src = imageByState[state];
    plantStatus.textContent = labelByState[state];
    plantArea.className = "plant-area " + state;
  }

  /**
   * Met à jour le compteur de temps avec animation.
   * @param {number|null} elapsedMs - millisecondes écoulées depuis le dernier arrosage
   */
  function updateTimer(elapsedMs) {
    if (!timerHours || !timerMinutes || !timerContainer) return;
    
    if (elapsedMs === null) {
      // Jamais arrosé
      timerHours.textContent = "∞";
      timerMinutes.textContent = "";
      timerContainer.className = "timer-container danger";
      return;
    }

    var totalMinutes = Math.floor(elapsedMs / (60 * 1000));
    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;

    // Animer le changement de valeur
    if (timerHours.textContent !== hours.toString()) {
      timerHours.style.animation = "none";
      setTimeout(function() {
        timerHours.style.animation = "";
      }, 10);
    }

    timerHours.textContent = hours;
    timerMinutes.textContent = minutes.toString().padStart(2, "0");

    // Changer la couleur selon le temps écoulé
    var elapsedHours = elapsedMs / (60 * 60 * 1000);
    if (elapsedHours >= THRESHOLD_DEAD_H) {
      timerContainer.className = "timer-container danger";
    } else if (elapsedHours >= THRESHOLD_WILTED_H) {
      timerContainer.className = "timer-container warning";
    } else {
      timerContainer.className = "timer-container";
    }
  }

  /**
   * Envoie une notification navigateur si autorisées et délai respecté.
   */
  function maybeSendNotification(elapsedHours) {
    if (elapsedHours === null || elapsedHours < NOTIFY_AFTER_H) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    var lastNotify = localStorage.getItem(NOTIFY_LAST_KEY);
    var now = Date.now();
    if (lastNotify && now - parseInt(lastNotify, 10) < NOTIFY_COOLDOWN_MS) return;

    try {
      new Notification("Hydro-Plante", {
        body: "N'oublie pas de boire de l'eau ! Arrose ta plante 🌱",
        icon: null
      });
      localStorage.setItem(NOTIFY_LAST_KEY, now.toString());
    } catch (e) {
      // notification non supportée ou erreur
    }
  }

  /**
   * Demande la permission des notifications (à appeler après un geste utilisateur).
   */
  function requestNotificationPermission() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  /**
   * Recalcule l'état à partir du dernier arrosage et met à jour l'UI + notifications.
   */
  function tick() {
    var last = getLastWatering();
    var elapsedMs = last ? (Date.now() - last) : null;
    var elapsedHours = elapsedMs ? elapsedMs / (60 * 60 * 1000) : null;
    
    var state = getPlantState(elapsedHours);
    renderPlant(state);
    updateTimer(elapsedMs);
    maybeSendNotification(elapsedHours);
  }

  /**
   * Met à jour uniquement le compteur (appelé plus fréquemment).
   */
  function tickTimer() {
    var last = getLastWatering();
    var elapsedMs = last ? (Date.now() - last) : null;
    updateTimer(elapsedMs);
  }

  /**
   * Gestion du clic / toucher sur "Arroser la plante".
   */
  function onWaterClick() {
    setLastWatering();
    tick();
    requestNotificationPermission();
    
    // Animation du bouton
    waterBtn.style.transform = "scale(0.95)";
    setTimeout(function() {
      waterBtn.style.transform = "";
    }, 200);
  }

  // --- Initialisation ---
  if (waterBtn) {
    waterBtn.addEventListener("click", onWaterClick);
  }
  
  // Premier affichage
  tick();
  
  // Mise à jour régulière de l'état de la plante
  setInterval(tick, TICK_MS);
  
  // Mise à jour plus fréquente du compteur (chaque seconde pour fluidité)
  setInterval(tickTimer, TIMER_UPDATE_MS);
})();
