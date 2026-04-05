"""
Cloud Function: publish_story_instagrapi
Publishes Instagram Stories with StoryMention, StoryLink, and StoryHashtag
using instagrapi (private API). Called by the Vercel cron via HTTPS.
"""

from __future__ import annotations
import json
import os
import tempfile
import requests
from firebase_functions import https_fn
from flask import jsonify
from google.cloud import storage
# Lazy imports — instagrapi is heavy, import inside function to avoid deployment timeout
# from instagrapi import Client
# from instagrapi.types import StoryMention, StoryLink, StoryHashtag, UserShort

# Config
STORAGE_BUCKET = os.environ.get("STORAGE_BUCKET", "mon-acupunctrice-hub.firebasestorage.app")
SESSION_BLOB = os.environ.get("SESSION_BLOB", "instagrapi/session.json")
DEFAULT_CLINIC = os.environ.get("DEFAULT_CLINIC", "lasourceensoi")
DEFAULT_LINK = os.environ.get("DEFAULT_LINK", "https://acupuncturejudith.ca")

# Default sticker coordinates (aligned with Judith's Canva template 1080x1920)
DEFAULT_MENTION_COORDS = {"x": 0.5, "y": 0.86, "width": 0.7, "height": 0.04}
DEFAULT_LINK_COORDS = {"x": 0.5, "y": 0.75, "width": 0.5, "height": 0.08}
DEFAULT_HASHTAG_COORDS = {"x": 0.5, "y": 0.93, "width": 0.5, "height": 0.04}


def load_session(cl: Client) -> bool:
    """Load instagrapi session from Cloud Storage."""
    try:
        bucket = storage.Client().bucket(STORAGE_BUCKET)
        blob = bucket.blob(SESSION_BLOB)
        if not blob.exists():
            return False
        data = json.loads(blob.download_as_text())
        cl.set_settings(data)
        cl.login(os.environ["IG_USERNAME"], os.environ["IG_PASSWORD"])
        return True
    except Exception:
        return False


def save_session(cl: Client):
    """Save instagrapi session to Cloud Storage."""
    try:
        bucket = storage.Client().bucket(STORAGE_BUCKET)
        blob = bucket.blob(SESSION_BLOB)
        blob.upload_from_string(json.dumps(cl.get_settings()), content_type="application/json")
    except Exception:
        pass


def get_client() -> Client:
    """Get authenticated instagrapi client."""
    cl = Client()
    cl.delay_range = [1, 3]

    if not load_session(cl):
        cl.login(os.environ["IG_USERNAME"], os.environ["IG_PASSWORD"])
        save_session(cl)

    return cl


def download_media(url: str, suffix: str = ".jpg") -> str:
    """Download media to temp file."""
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(resp.content)
    tmp.close()
    return tmp.name


@https_fn.on_request(secrets=["IG_USERNAME", "IG_PASSWORD"])
def publish_story_instagrapi(req: https_fn.Request) -> https_fn.Response:
    """HTTPS Cloud Function — publishes an IG Story with mention/link/hashtag."""
    if req.method == "OPTIONS":
        return https_fn.Response("", 204, {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST"})

    try:
        from instagrapi import Client
        from instagrapi.types import StoryMention, StoryLink, StoryHashtag, UserShort

        body = req.get_json(silent=True) or {}

        video_url = body.get("videoUrl")
        image_url = body.get("imageUrl")
        caption = body.get("caption", "")
        clinic_username = body.get("clinicUsername", DEFAULT_CLINIC)
        link_url = body.get("linkUrl", DEFAULT_LINK)
        hashtags = body.get("hashtags", ["acupuncture"])

        # Coordinates (configurable, with defaults)
        mention_coords = body.get("mentionCoords", DEFAULT_MENTION_COORDS)
        link_coords = body.get("linkCoords", DEFAULT_LINK_COORDS)
        hashtag_coords = body.get("hashtagCoords", DEFAULT_HASHTAG_COORDS)

        if not video_url and not image_url:
            return jsonify({"success": False, "error": "videoUrl or imageUrl required"}), 400

        cl = get_client()

        # Resolve clinic user
        clinic_user_full = cl.user_info_by_username(clinic_username)
        clinic_user = UserShort(
            pk=clinic_user_full.pk,
            username=clinic_user_full.username,
            full_name=clinic_user_full.full_name or "",
            profile_pic_url=clinic_user_full.profile_pic_url,
        )

        # Build stickers
        stickers = []
        stickers.append(StoryMention(user=clinic_user, **mention_coords))
        stickers.append(StoryLink(url=link_url, **link_coords))
        if hashtags:
            stickers.append(StoryHashtag(hashtag=hashtags[0], **hashtag_coords))

        # Download media and publish
        if video_url:
            media_path = download_media(video_url, suffix=".mp4")
            story = cl.video_upload_to_story(
                media_path, caption=caption,
                mentions=[s for s in stickers if isinstance(s, StoryMention)],
                links=[s for s in stickers if isinstance(s, StoryLink)],
                hashtags=[s for s in stickers if isinstance(s, StoryHashtag)],
            )
        else:
            media_path = download_media(image_url, suffix=".jpg")
            story = cl.photo_upload_to_story(
                media_path, caption=caption,
                mentions=[s for s in stickers if isinstance(s, StoryMention)],
                links=[s for s in stickers if isinstance(s, StoryLink)],
                hashtags=[s for s in stickers if isinstance(s, StoryHashtag)],
            )

        save_session(cl)

        # Cleanup temp file
        os.unlink(media_path)

        return jsonify({"success": True, "storyPk": str(story.pk)})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
