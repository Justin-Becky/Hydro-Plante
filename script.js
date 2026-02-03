/**
 * Hydro-Plante — Logique d'état, timer et notifications
 * Compatible GitHub Pages, mobile et PC, sans dépendances.
 */

(function () {
  "use strict";

  // --- Constantes (seuils en heures) ---
  var THRESHOLD_WILTED_H = 2;   // après 2h sans eau → fanée
  var THRESHOLD_DEAD_H = 4;     // après 4h sans eau → morte
  var NOTIFY_AFTER_H = 1;       // envoyer une notification après 1h sans arrosage
  var NOTIFY_COOLDOWN_MS = 30 * 60 * 1000; // pas plus d'une notif toutes les 30 min
  var TICK_MS = 60 * 1000;      // recalcul toutes les minutes

  var STORAGE_KEY = "hydroPlante_lastWatering";
  var NOTIFY_LAST_KEY = "hydroPlante_lastNotify";

  var plantArea = document.getElementById("plantArea");
  var plantEmoji = document.getElementById("plantEmoji");
  var plantStatus = document.getElementById("plantStatus");
  var waterBtn = document.getElementById("waterBtn");

  var emojiByState = {
    normal: "🌱",
    wilted: "🪴",
    dead: "💀"
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
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
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
    plantEmoji.textContent = emojiByState[state];
    plantStatus.textContent = labelByState[state];
    plantArea.className = "plant-area " + state;
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
    var elapsedHours = last ? (Date.now() - last) / (60 * 60 * 1000) : null;
    var state = getPlantState(elapsedHours);
    renderPlant(state);
    maybeSendNotification(elapsedHours);
  }

  /**
   * Gestion du clic / toucher sur "Arroser la plante".
   */
  function onWaterClick() {
    setLastWatering();
    tick();
    requestNotificationPermission();
  }

  // --- Initialisation ---
  if (waterBtn) {
    waterBtn.addEventListener("click", onWaterClick);
  }
  tick();
  setInterval(tick, TICK_MS);
})();
