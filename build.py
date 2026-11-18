"""Build dist/index.html by injecting a question file into template.html.

Usage:
  python build.py                          # uses data/sample-questions.json
  python build.py --data my-questions.json # builds with your own questions (keep that copy private)
"""
import argparse, json, pathlib

root = pathlib.Path(__file__).parent
ap = argparse.ArgumentParser()
ap.add_argument("--data", default=str(root / "data/sample-questions.json"), help="question JSON file")
ap.add_argument("--out", default=str(root / "dist/index.html"), help="output HTML file")
args = ap.parse_args()

data = json.loads(pathlib.Path(args.data).read_text(encoding="utf-8"))
tpl = (root / "template.html").read_text(encoding="utf-8")
# Escape "</" so question text can never close the <script> tag early.
payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
out = tpl.replace("__DATA_JSON__", payload)
out_path = pathlib.Path(args.out)
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(out, encoding="utf-8")
print(f"Built {out_path.relative_to(root) if out_path.is_relative_to(root) else out_path} ({len(data)} questions, {len(out)//1024} KB)")
