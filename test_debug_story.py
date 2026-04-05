#!/usr/bin/env python3
"""Debug test — log exactement ce que instagrapi envoie à Instagram"""

import os, sys, json, logging
from pathlib import Path
from getpass import getpass
from unittest.mock import patch
from instagrapi import Client
from instagrapi.types import StoryMention, StoryLink, StoryHashtag, UserShort
from instagrapi.exceptions import LoginRequired, ChallengeRequired, BadPassword

SESSION_FILE = Path("/Users/benoitarchambault/Desktop/Mon_Acupunctrice/instagrapi-test/session.json")
IMAGE_FILE = Path(__file__).parent / "Votre texte de paragraphe.png"

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

username = os.environ.get("IG_USERNAME") or input("Instagram username: ")
password = os.environ.get("IG_PASSWORD") or getpass("Instagram password: ")

cl = Client()
cl.delay_range = [1, 3]

# Load session
session = json.loads(SESSION_FILE.read_text())
cl.set_settings(session)
cl.login(username, password)
cl.get_timeline_feed()
logger.info("✅ Login OK")
cl.dump_settings(str(SESSION_FILE))

# Get clinic user
full = cl.user_info_by_username("lasourceensoi")
clinic = UserShort(pk=full.pk, username=full.username, full_name=full.full_name,
    profile_pic_url=full.profile_pic_url, is_private=full.is_private, is_verified=full.is_verified)
logger.info(f"✅ Clinic: {clinic.full_name} pk={clinic.pk}")

# Patch private_request to intercept the configure_to_story call
original_private_request = cl.private_request
def debug_private_request(endpoint, data=None, *args, **kwargs):
    if "configure_to_story" in endpoint:
        logger.info(f"═══ INTERCEPTED: {endpoint} ═══")
        if data:
            for k, v in data.items():
                if k in ("tap_models", "reel_mentions", "story_sticker_ids", "caption"):
                    logger.info(f"  {k}: {v}")
        logger.info("═══ END INTERCEPTED ═══")
    return original_private_request(endpoint, data, *args, **kwargs)

cl.private_request = debug_private_request

# Prepare stickers
mention = StoryMention(user=clinic, x=0.5, y=0.87, width=0.7, height=0.05)
link = StoryLink(webUri="https://www.gorendezvous.com/lasourceensoi")
ht = cl.hashtag_info("acupuncture")
hashtag = StoryHashtag(hashtag=ht, x=0.5, y=0.93, width=0.5, height=0.04)

logger.info("📤 Publishing with debug...")
story = cl.photo_upload_to_story(
    path=str(IMAGE_FILE),
    caption=f"@lasourceensoi",
    mentions=[mention],
    links=[link],
    hashtags=[hashtag],
)
logger.info(f"✅ Story pk={story.pk}")
