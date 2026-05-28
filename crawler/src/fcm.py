"""
FCM push notification sender using Firebase Admin SDK.
GOOGLE_APPLICATION_CREDENTIALS env var must point to a service account JSON file,
or FIREBASE_SERVICE_ACCOUNT_JSON env var can hold the JSON string directly.
"""

import os
import json
import logging

logger = logging.getLogger(__name__)

_app = None


def _get_app():
    global _app
    if _app is not None:
        return _app

    try:
        import firebase_admin
        from firebase_admin import credentials

        sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        if sa_json:
            sa_dict = json.loads(sa_json)
            cred = credentials.Certificate(sa_dict)
        else:
            cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            if not cred_path:
                return None
            cred = credentials.Certificate(cred_path)

        _app = firebase_admin.initialize_app(cred)
    except Exception as e:
        logger.warning(f"[fcm] Firebase init failed (push disabled): {e}")
        _app = None

    return _app


def send_push(token: str, title: str, body: str, data: dict | None = None) -> bool:
    """Send a single FCM push notification. Returns True on success."""
    app = _get_app()
    if app is None:
        return False

    try:
        from firebase_admin import messaging
        msg = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data={k: str(v) for k, v in (data or {}).items()},
            token=token,
        )
        messaging.send(msg)
        return True
    except Exception as e:
        logger.error(f"[fcm] send_push failed for token ...{token[-6:]}: {e}")
        return False


def send_multicast(tokens: list[str], title: str, body: str, data: dict | None = None) -> int:
    """Send to multiple tokens. Returns number of successful sends."""
    if not tokens:
        return 0
    app = _get_app()
    if app is None:
        return 0

    try:
        from firebase_admin import messaging
        msg = messaging.MulticastMessage(
            notification=messaging.Notification(title=title, body=body),
            data={k: str(v) for k, v in (data or {}).items()},
            tokens=tokens,
        )
        response = messaging.send_each_for_multicast(msg)
        return response.success_count
    except Exception as e:
        logger.error(f"[fcm] send_multicast failed: {e}")
        return 0
