#!/usr/bin/env python3
"""
Script GitHub Actions pour vérifier l'état de la plante et envoyer des emails de rappel.
"""

import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

# Configuration
PLANT_STATE_FILE = "plant_state.json"
THRESHOLD_WILTED_H = 2  # heures sans eau → fanée
THRESHOLD_DEAD_H = 4    # heures sans eau → morte
NOTIFY_AFTER_H = 1      # envoyer notification après 1h

def load_plant_state():
    """Charge l'état de la plante depuis le fichier JSON."""
    try:
        with open(PLANT_STATE_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Premier lancement : initialiser avec un état par défaut
        return {"last_watering": None, "last_notification": None}

def save_plant_state(state):
    """Sauvegarde l'état de la plante dans le fichier JSON."""
    with open(PLANT_STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def get_plant_status(last_watering):
    """Détermine l'état de la plante."""
    if last_watering is None:
        return "wilted", None
    
    # Gérer le format ISO avec Z (UTC)
    last_watering_clean = last_watering.replace('Z', '+00:00')
    last_water_time = datetime.fromisoformat(last_watering_clean)
    elapsed = datetime.now() - last_water_time
    elapsed_hours = elapsed.total_seconds() / 3600
    
    if elapsed_hours < THRESHOLD_WILTED_H:
        return "normal", elapsed_hours
    elif elapsed_hours < THRESHOLD_DEAD_H:
        return "wilted", elapsed_hours
    else:
        return "dead", elapsed_hours

def should_send_notification(state, elapsed_hours):
    """Vérifie si on doit envoyer une notification."""
    if elapsed_hours is None or elapsed_hours < NOTIFY_AFTER_H:
        return False
    
    # Vérifier si on n'a pas déjà envoyé de notification récemment
    if state.get("last_notification"):
        last_notif = datetime.fromisoformat(state["last_notification"])
        if datetime.now() - last_notif < timedelta(hours=2):
            return False
    
    return True

def send_email(recipient_email, plant_status, elapsed_hours):
    """Envoie un email de rappel."""
    sender_email = os.environ.get("SENDER_EMAIL")
    sender_password = os.environ.get("SENDER_PASSWORD")
    
    if not sender_email or not sender_password:
        print("❌ Variables d'environnement EMAIL non configurées")
        return False
    
    # Personnaliser le message selon l'état
    if plant_status == "dead":
        subject = "🚨 Ta plante Hydro-Plante est morte !"
        body = f"""Coucou ! 💚

Ta plante virtuelle Hydro-Plante est morte ! 😢

Elle n'a pas été arrosée depuis {elapsed_hours:.1f} heures.

N'oublie pas de boire de l'eau régulièrement ! 💧
Clique ici pour arroser ta plante (et te rappeler de t'hydrater) : 
https://ton-username.github.io/hydro-plante/

Bisous ! 🌱
"""
    elif plant_status == "wilted":
        subject = "💧 Ta plante Hydro-Plante a soif !"
        body = f"""Coucou ! 💚

Ta plante virtuelle commence à faner... 🥀

Elle n'a pas été arrosée depuis {elapsed_hours:.1f} heures.

C'est le moment de boire un grand verre d'eau ! 💧
Arrose ta plante ici : https://ton-username.github.io/hydro-plante/

Prends soin de toi ! 🌱
"""
    else:
        return False  # Pas besoin d'envoyer si la plante va bien
    
    # Créer le message
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain', 'utf-8'))
    
    try:
        # Connexion SMTP (Gmail)
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

def main():
    """Fonction principale."""
    print("🌱 Vérification de l'état de la plante...")
    
    # Charger l'état
    state = load_plant_state()
    
    # Vérifier l'état de la plante
    plant_status, elapsed_hours = get_plant_status(state.get("last_watering"))
    
    print(f"État actuel : {plant_status}")
    if elapsed_hours is not None:
        print(f"Dernière eau il y a {elapsed_hours:.2f} heures")
    
    # Vérifier si on doit envoyer une notification
    if should_send_notification(state, elapsed_hours):
        recipient = os.environ.get("RECIPIENT_EMAIL")
        if recipient and send_email(recipient, plant_status, elapsed_hours):
            state["last_notification"] = datetime.now().isoformat()
            save_plant_state(state)
    else:
        print("Pas de notification à envoyer pour le moment")

if __name__ == "__main__":
    main()
