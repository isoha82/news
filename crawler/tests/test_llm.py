"""
Unit tests for llm.py — mock HTTP so no real API key is needed.
"""
import sys
import os
import json
import unittest
from unittest.mock import patch, MagicMock
from io import BytesIO

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

import llm


class TestSummarizeArticle(unittest.TestCase):

    def test_returns_none_when_no_api_key(self):
        with patch.dict(os.environ, {"OPENAI_API_KEY": ""}):
            # Re-read env var inline
            original = llm.OPENAI_API_KEY
            llm.OPENAI_API_KEY = ""
            result = llm.summarize_article("title", "body")
            llm.OPENAI_API_KEY = original
            self.assertIsNone(result)

    def _mock_response(self, bullets: dict):
        """Build a fake urllib response returning bullets JSON."""
        payload = {
            "choices": [{
                "message": {
                    "content": json.dumps(bullets)
                }
            }]
        }
        mock_resp = MagicMock()
        mock_resp.read.return_value = json.dumps(payload).encode()
        mock_resp.__enter__ = lambda s: s
        mock_resp.__exit__ = MagicMock(return_value=False)
        return mock_resp

    def test_returns_bullets_on_success(self):
        bullets = {"bullet1": "First point.", "bullet2": "Second point.", "bullet3": "Third point."}
        mock_resp = self._mock_response(bullets)

        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}):
            llm.OPENAI_API_KEY = "test-key"
            with patch("urllib.request.urlopen", return_value=mock_resp):
                result = llm.summarize_article("Some title", "Some body text")

        self.assertEqual(result, bullets)

    def test_returns_none_on_missing_keys(self):
        bad_payload = {
            "choices": [{
                "message": {
                    "content": json.dumps({"only_one": "value"})
                }
            }]
        }
        mock_resp = MagicMock()
        mock_resp.read.return_value = json.dumps(bad_payload).encode()
        mock_resp.__enter__ = lambda s: s
        mock_resp.__exit__ = MagicMock(return_value=False)

        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}):
            llm.OPENAI_API_KEY = "test-key"
            with patch("urllib.request.urlopen", return_value=mock_resp):
                result = llm.summarize_article("title", "body")

        self.assertIsNone(result)

    def test_returns_none_on_network_error(self):
        import urllib.error
        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}):
            llm.OPENAI_API_KEY = "test-key"
            with patch("urllib.request.urlopen", side_effect=urllib.error.URLError("timeout")):
                result = llm.summarize_article("title", "body")

        self.assertIsNone(result)


if __name__ == "__main__":
    unittest.main()
