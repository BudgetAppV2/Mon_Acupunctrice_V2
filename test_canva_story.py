#!/usr/bin/env python3
"""
Test instagrapi — Story vidéo Canva avec mention @lasourceensoi + lien GoRendezVous
Usage: python3 test_canva_story.py --dry-run   (valider sans publier)
       python3 test_canva_story.py              (publier pour vrai)
"""

import os, sys, json, logging
from pathlib import Path
from getpass import getpass
from instagrapi import Client
from instagrapi.types import StoryMention, StoryLink, StoryHashtag, UserShort
from instagrapi.exceptions import LoginRequired, ChallengeRequired, BadPassword

SESSION_FILE = Path("/Users/benoitarchambault/Desktop/Mon_Acupunctrice/instagrapi-test/session.json")
IMAGE_FILE = Path(__file__).parent / "Votre texte de paragraphe (1).mp4"

CLINIC_USERNAME = "lasourceensoi"
LINK_URL = "https://www.gorendezvous.com/lasourceensoi"
HASHTAG = "acupuncture"

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def login_user(username, password):
    cl = Client()
    cl.delay_range = [1, 3]
    login_ok = False

    if SESSION_FILE.exists():
        logger.info("Session trouvée, réutilisation...")
        try:
            session = json.loads(SESSION_FILE.read_text())
            cl.set_settings(session)
            cl.login(username, password)
            try:
                cl.get_timeline_feed()
                login_ok = True
                logger.info("✅ Login via session!")
            except LoginRequired:
                old = cl.get_settings()
                cl.set_settings({})
                cl.set_uuids(old["uuids"])
                cl.login(username, password)
                login_ok = True
        except Exception as e:
            logger.warning(f"Session échouée: {e}")

    if not login_ok:
        logger.info("Login par password...")
        try:
            if cl.login(username, password):
                login_ok = True
                logger.info("✅ Login OK!")
        except BadPassword:
            logger.error("❌ Mauvais mot de passe!"); sys.exit(1)
        except ChallengeRequired:
            logger.error("❌ Challenge 2FA requis."); sys.exit(1)

    if not login_ok:
        logger.error("❌ Login impossible."); sys.exit(1)

    cl.dump_settings(str(SESSION_FILE))
    return cl

def publish(cl, dry_run=False):
    # 1. Trouver la clinique
    logger.info(f"Recherche @{CLINIC_USERNAME}...")
    full = cl.user_info_by_username(CLINIC_USERNAME)
    clinic = UserShort(
        pk=full.pk, username=full.username, full_name=full.full_name,
        profile_pic_url=full.profile_pic_url, is_private=full.is_private,
        is_verified=full.is_verified,
    )
    logger.info(f"✅ {clinic.full_name} (pk={clinic.pk})")

    # 2. Stickers — coordonnées alignées sur le template Canva
    # @LASOURCEENSOI texte visible à y=0.86 dans le design
    mention = StoryMention(user=clinic, x=0.5, y=0.86, width=0.7, height=0.04)
    # Lien GoRendezVous texte visible à y=0.75 dans le design
    link = StoryLink(webUri=LINK_URL)

    hashtags = []
    try:
        ht = cl.hashtag_info(HASHTAG)
        hashtags.append(StoryHashtag(hashtag=ht, x=0.5, y=0.93, width=0.5, height=0.04))
        logger.info(f"✅ #{HASHTAG} prêt")
    except Exception as e:
        logger.warning(f"Hashtag ignoré: {e}")

    if dry_run:
        logger.info("═══ DRY RUN ═══")
        logger.info(f"  Vidéo:    {IMAGE_FILE}")
        logger.info(f"  Mention:  @{CLINIC_USERNAME} (y=0.87)")
        logger.info(f"  Lien:     {LINK_URL}")
        logger.info(f"  Hashtag:  #{HASHTAG} (y=0.93)")
        logger.info("═══ OK! Relance sans --dry-run ═══")
        return True

    # 3. Publier la story vidéo
    logger.info("📤 Publication story vidéo...")
    story = cl.video_upload_to_story(
        path=str(IMAGE_FILE),
        caption=f"@{CLINIC_USERNAME}",
        mentions=[mention],
        links=[link],
        hashtags=hashtags,
    )
    logger.info(f"✅ STORY PUBLIÉE! pk={story.pk}")
    return True

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    username = os.environ.get("IG_USERNAME") or input("Instagram username: ")
    password = os.environ.get("IG_PASSWORD") or getpass("Instagram password: ")
    cl = login_user(username, password)
    if publish(cl, dry_run):
        logger.info("═══ TERMINÉ! ═══")
    else:
        sys.exit(1)
