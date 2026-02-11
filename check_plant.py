#!/usr/bin/env python3
"""
Script GitHub Actions pour vérifier l'état des plantes et envoyer des emails de rappel.
Supporte plusieurs utilisateurs (Justin et Becky).
"""

import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

# Configuration
PLANT_STATE_FILE = "plant_state.json"
THRESHOLD_WILTED_H = 2  # heures sans eau → fanée
THRESHOLD_DEAD_H = 4    # heures sans eau → morte
NOTIFY_AFTER_H = 1      # envoyer notification après 1h

# Fuseau horaire local
USER_TIMEZONE = ZoneInfo("America/Montreal")
NIGHT_START_HOUR = 18
MORNING_HOUR = 7

# Configuration par utilisateur
USER_CONFIG = {
    "justin": {"env_var": "RECIPIENT_EMAIL"},
    "becky":  {"env_var": "RECIPIENT_EMAIL_2"}
}

def load_plant_state():
    """Charge l'état des plantes depuis le fichier JSON."""
    try:
        with open(PLANT_STATE_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "justin": {"last_watering": None, "last_notification": None},
            "becky":  {"last_watering": None, "last_notification": None}
        }

def save_plant_state(state):
    """Sauvegarde l'état des plantes dans le fichier JSON."""
    with open(PLANT_STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def get_plant_status(last_watering):
    """Détermine l'état de la plante."""
    if last_watering is None:
        return "wilted", None

    # Gérer différents formats ISO
    last_watering_clean = last_watering.strip()

    # Remplacer Z par +00:00 pour Python < 3.11
    if last_watering_clean.endswith('Z'):
        last_watering_clean = last_watering_clean[:-1] + '+00:00'

    try:
        last_water_time = datetime.fromisoformat(last_watering_clean)
    except ValueError:
        print(f"⚠️ Format de date invalide : {last_watering}")
        return "wilted", None

    # Utiliser UTC pour la comparaison si la date a une timezone
    if last_water_time.tzinfo is not None:
        now = datetime.now(timezone.utc)
    else:
        now = datetime.now()

    elapsed = now - last_water_time
    elapsed_hours = elapsed.total_seconds() / 3600

    if elapsed_hours < THRESHOLD_WILTED_H:
        return "normal", elapsed_hours
    elif elapsed_hours < THRESHOLD_DEAD_H:
        return "wilted", elapsed_hours
    else:
        return "dead", elapsed_hours

def is_night_window():
    """Retourne True si l'heure locale est dans la fenêtre de nuit (18h-7h)."""
    now_local = datetime.now(USER_TIMEZONE)
    hour = now_local.hour
    return hour >= NIGHT_START_HOUR or hour < MORNING_HOUR

def should_send_notification(user_state, elapsed_hours):
    """Vérifie si on doit envoyer une notification."""
    if elapsed_hours is None or elapsed_hours < NOTIFY_AFTER_H:
        return False

    # Vérifier si on n'a pas déjà envoyé de notification récemment
    if user_state.get("last_notification"):
        last_notif_str = user_state["last_notification"]
        # Gérer le Z si présent
        if last_notif_str.endswith('Z'):
            last_notif_str = last_notif_str[:-1] + '+00:00'

        try:
            last_notif = datetime.fromisoformat(last_notif_str)
            if last_notif.tzinfo is not None:
                now = datetime.now(timezone.utc)
            else:
                now = datetime.now()

            if now - last_notif < timedelta(minutes=25):
                return False
        except ValueError:
            pass

    return True

def send_email(recipient_email, plant_status, elapsed_hours):
    """Envoie un email de rappel selon l'état de la plante."""
    sender_email = os.environ.get("SENDER_EMAIL")
    sender_password = os.environ.get("SENDER_PASSWORD")

    if not sender_email or not sender_password:
        print("❌ Variables d'environnement EMAIL non configurées")
        return False

    if plant_status == "dead":
        subject = "🚨 Ta plante Hydro-Plante est morte !"
        body = f"""Coucou ! 💚

Ta plante virtuelle Hydro-Plante est morte ! 😢

Elle n'a pas été arrosée depuis {elapsed_hours:.1f} heures.

N'oublie pas de boire de l'eau régulièrement ! 💧

Bisous ! 🌱
"""
    elif plant_status == "wilted":
        subject = "💧 Ta plante Hydro-Plante a soif !"
        body = f"""Coucou ! 💚

Ta plante virtuelle commence à faner... 🥀

Elle n'a pas été arrosée depuis {elapsed_hours:.1f} heures.

C'est le moment de boire un grand verre d'eau ! 💧

Prends soin de toi ! 🌱
"""
    else:
        return False

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain', 'utf-8'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"✅ Email envoyé à {recipient_email}")
        return True
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi : {e}")
        return False

def send_morning_email(recipient_email, user_name):
    """Envoie un email de rappel matinal."""
    sender_email = os.environ.get("SENDER_EMAIL")
    sender_password = os.environ.get("SENDER_PASSWORD")

    if not sender_email or not sender_password:
        print("❌ Variables d'environnement EMAIL non configurées")
        return False

    display_name = user_name.capitalize()
    subject = f"☀️ Bonjour {display_name} ! N'oublie pas de boire de l'eau"
    body = f"""Bonjour {display_name} ! ☀️

C'est le moment de commencer la journée avec un grand verre d'eau ! 💧

Ta plante Hydro-Plante t'attend. N'oublie pas de l'arroser régulièrement aujourd'hui.

Bonne journée ! 🌱
"""

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain', 'utf-8'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"✅ Email matinal envoyé à {recipient_email}")
        return True
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi : {e}")
        return False

def main():
    """Fonction principale."""
    print("🌱 Vérification de l'état des plantes...")

    # Déterminer si c'est le rappel du matin
    is_morning = os.environ.get("MORNING_REMINDER") == "true"

    # Vérifier la fenêtre de nuit
    night = is_night_window()
    if night and not is_morning:
        print("🌙 Mode nuit actif (18h-7h) — pas de notifications de dégradation")

    state = load_plant_state()
    state_changed = False

    for user_name, config in USER_CONFIG.items():
        print(f"\n--- {user_name} ---")
        user_state = state.get(user_name, {"last_watering": None, "last_notification": None})

        if is_morning:
            # Envoyer le rappel du matin
            recipient = os.environ.get(config["env_var"])
            if recipient:
                send_morning_email(recipient, user_name)
            else:
                print(f"⚠️ Pas d'email configuré pour {user_name}")
            continue

        plant_status, elapsed_hours = get_plant_status(user_state.get("last_watering"))
        print(f"État actuel : {plant_status}")
        if elapsed_hours is not None:
            print(f"Dernière eau il y a {elapsed_hours:.2f} heures")

        # Pendant la nuit, ne pas envoyer de notifications de dégradation
        if night:
            print("🌙 Nuit : notification ignorée")
            continue

        if should_send_notification(user_state, elapsed_hours):
            recipient = os.environ.get(config["env_var"])
            if recipient and send_email(recipient, plant_status, elapsed_hours):
                user_state["last_notification"] = datetime.now(timezone.utc).isoformat()
                state[user_name] = user_state
                state_changed = True
        else:
            print("Pas de notification à envoyer")

    if state_changed:
        save_plant_state(state)

if __name__ == "__main__":
    main()
