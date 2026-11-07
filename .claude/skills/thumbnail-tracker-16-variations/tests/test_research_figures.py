"""Every N.NN× figure in the research docs must trace back to the data files (scripts/verify_research.py)."""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import verify_research  # noqa: E402


class ResearchFigureTests(unittest.TestCase):
    def test_all_figures_trace_to_data(self):
        r = verify_research.verify()
        self.assertGreater(r["figures"], 50)
        self.assertEqual(r["unmatched"], [], "\n".join(f"{u['file']}:{u['line']} {u['figure']}" for u in r["unmatched"]))

    def test_rounding_rules(self):
        self.assertEqual(verify_research.norm("7.70"), "7.7")
        self.assertEqual(verify_research.norm(2.0, 2), "2")


if __name__ == "__main__":
    unittest.main()
