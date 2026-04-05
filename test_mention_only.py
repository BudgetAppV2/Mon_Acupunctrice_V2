#!/usr/bin/env python3
"""Test minimal — SEULEMENT la mention, pas de lien ni hashtag"""
import os, sys, json, logging
from pathlib import Path
from getpass import getpass
from instagrapi import Client
from instagrapi.types import StoryMention, UserShort
from instagrapi.exceptions import LoginRequired

SESSION_FILE = Path("/Users/benoitarchambault/Desktop/Mon_Acupunctrice/instagrapi-test/session.json")
IMAGE_FILE = Path(__file__).parent / "Votre texte de paragraphe.png"

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

username = os.environ.get("IG_USERNAME") or input("Instagram username: ")
password = os.environ.get("IG_PASSWORD") or getpass("Instagram password: ")

cl = Client()
cl.delay_range = [1, 3]
session = json.loads(SESSION_FILE.read_text())
cl.set_settings(session)
cl.login(username, password)
cl.get_timeline_feed()
logger.info("✅ Login OK")
cl.dump_settings(str(SESSION_FILE))
