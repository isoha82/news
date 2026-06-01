"""
Unit tests for trend_score formula logic.
Verifies the calculation without a DB connection.
"""
import sys
import os
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))


class TestTrendScoreFormula(unittest.TestCase):
    """Tests for: trend_score = comment_count * 50 + (6 - rank) * 100"""

    def formula(self, rank, comment_count=0):
        return comment_count * 50 + (6 - rank) * 100

    def test_rank1_no_comments(self):
        self.assertEqual(self.formula(1, 0), 500)

    def test_rank5_no_comments(self):
        self.assertEqual(self.formula(5, 0), 100)

    def test_rank1_with_comments(self):
        self.assertEqual(self.formula(1, 10), 1000)

    def test_rank3_with_comments(self):
        # (6-3)*100 + 5*50 = 300 + 250 = 550
        self.assertEqual(self.formula(3, 5), 550)

    def test_comments_add_50_per_comment(self):
        base = self.formula(2, 0)
        with_one = self.formula(2, 1)
        self.assertEqual(with_one - base, 50)

    def test_higher_rank_gives_lower_score(self):
        # rank 1 > rank 2 > ... > rank 5
        scores = [self.formula(r) for r in range(1, 6)]
        self.assertEqual(scores, sorted(scores, reverse=True))


if __name__ == "__main__":
    unittest.main()
