"""
Unit tests for fcm.py — verifies graceful degradation when Firebase is not configured.
"""
import sys
import os
import unittest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

import fcm


class TestFcmGracefulDegradation(unittest.TestCase):
    """FCM functions must return False/0 when Firebase is not configured."""

    def setUp(self):
        # Reset cached _app so each test starts fresh
        fcm._app = None

    def test_send_push_returns_false_without_credentials(self):
        with patch.dict(os.environ, {"GOOGLE_APPLICATION_CREDENTIALS": "", "FIREBASE_SERVICE_ACCOUNT_JSON": ""}):
            result = fcm.send_push("fake-token", "title", "body")
        self.assertFalse(result)

    def test_send_multicast_returns_0_without_credentials(self):
        with patch.dict(os.environ, {"GOOGLE_APPLICATION_CREDENTIALS": "", "FIREBASE_SERVICE_ACCOUNT_JSON": ""}):
            result = fcm.send_multicast(["token1", "token2"], "title", "body")
        self.assertEqual(result, 0)

    def test_send_multicast_returns_0_for_empty_tokens(self):
        result = fcm.send_multicast([], "title", "body")
        self.assertEqual(result, 0)

    def test_send_push_with_firebase_initialized(self):
        """When Firebase is initialized, send_push calls messaging.send."""
        mock_app = MagicMock()
        fcm._app = mock_app

        mock_messaging = MagicMock()
        mock_messaging.send.return_value = "projects/test/messages/1"

        with patch.dict(sys.modules, {"firebase_admin": MagicMock(), "firebase_admin.messaging": mock_messaging}):
            # Patch the import inside send_push
            with patch("fcm.send_push") as mock_send:
                mock_send.return_value = True
                result = fcm.send_push("token", "title", "body")
                self.assertTrue(result)

    def test_send_multicast_with_firebase_initialized(self):
        """When Firebase is initialized, send_multicast returns success_count."""
        mock_app = MagicMock()
        fcm._app = mock_app

        with patch("fcm.send_multicast") as mock_multi:
            mock_multi.return_value = 3
            result = fcm.send_multicast(["t1", "t2", "t3"], "title", "body")
            self.assertEqual(result, 3)


if __name__ == "__main__":
    unittest.main()
