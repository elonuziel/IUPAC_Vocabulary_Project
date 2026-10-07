#!/usr/bin/env python3
"""
Bundle all modular JavaScript files in src/ into script.js
"""

from pathlib import Path
import sys

def bundle_js(src_dir="src", output_file="script.js"):
    src_path = Path(src_dir)
    if not src_path.exists():
        print(f"❌ Directory {src_dir} does not exist.")
        sys.exit(1)

    js_files = sorted(src_path.glob("*.js"))
    if not js_files:
        print(f"❌ No .js files found in {src_dir}")
        sys.exit(1)

    bundled_content = []
    print(f"🔨 Bundling {len(js_files)} JS modules into {output_file}...")
    for file_path in js_files:
        content = file_path.read_text(encoding="utf-8")
        bundled_content.append(content.strip())
        print(f"  ✓ Added {file_path.name}")

    header = """/* ────────────────────────────────────────────────────────────────
   IUPAC Vocabulary Companion - JavaScript (Bundled from src/)
   Main logic for search, filtering, 3D/2D viewing, quiz mode
   ──────────────────────────────────────────────────────────────── */\n\n"""

    full_output = header + "\n\n".join(bundled_content) + "\n"
    Path(output_file).write_text(full_output, encoding="utf-8")
    print(f"✅ Successfully created {output_file} ({len(full_output)} bytes)")

if __name__ == "__main__":
    bundle_js()
