#!/usr/bin/env python3
"""
Build a fully self-contained offline version of the IUPAC Chemistry App.
All CSS, JS, images, and data are embedded into a single HTML file.
"""

import json
import re
import os
import sys
import base64
import zipfile
from pathlib import Path
from datetime import datetime

def read_file(filepath):
    """Read file content"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"❌ Error reading {filepath}: {e}")
        sys.exit(1)

def read_binary_file(filepath):
    """Read binary file and encode as base64"""
    with open(filepath, 'rb') as f:
        return base64.b64encode(f.read()).decode('ascii')

def create_offline_html():
    """Create a self-contained HTML file with all assets embedded"""
    
    print("🔨 Building offline version...")
    print("  Reading source files...")
    
    # Read main files
    html_content = read_file('index.html')
    css_content = read_file('styles.css')
    js_content = read_file('script.js')
    
    # Load molecules
    with open('molecules.json', 'r', encoding='utf-8') as f:
        molecules = json.load(f)
    
    print(f"  ✓ Loaded {len(molecules)} molecules")
    
    # Replace the source startup handler so the standalone page never fetches
    # molecules.json from the local filesystem.
    offline_startup = """async function initOffline() {
    console.log('Offline mode: Using embedded molecules data');
    molecules = EMBEDDED_MOLECULES;
    setupTheme();
    setupFilters();
    updateStats();
    renderMolecules();
    setupEventListeners();
    console.log(`Loaded ${molecules.length} molecules offline`);
}
"""
    offline_js_source = re.sub(
        r'document\.addEventListener\(["\']DOMContentLoaded["\'],\s*init\s*\);',
        'document.addEventListener("DOMContentLoaded", initOffline);',
        js_content,
        count=1
    )

    # Create a modified script that uses embedded data
    offline_js = f"""
// ═══════════════════════════════════════════════════════════════
// OFFLINE MODE - Data embedded in HTML
// ═══════════════════════════════════════════════════════════════
const OFFLINE_MODE = true;
const EMBEDDED_MOLECULES = {json.dumps(molecules, ensure_ascii=False, separators=(',', ':'))};

{offline_startup}
{offline_js_source}
"""
    
    # Extract head content
    head_match = re.search(r'<head>(.*?)</head>', html_content, re.DOTALL)
    body_match = re.search(r'<body>(.*?)</body>', html_content, re.DOTALL)
    
    if not head_match or not body_match:
        print("❌ Could not parse HTML structure")
        sys.exit(1)
    
    head_content = head_match.group(1)
    body_content = body_match.group(1)
    
    # Remove external references
    head_content = re.sub(
        r'<link[^>]*href=["\']styles\.css["\'][^>]*>',
        '',
        head_content
    )
    body_content = re.sub(
        r'<script[^>]*src=["\']script\.js["\'][^>]*>\s*</script>',
        '',
        body_content
    )
    
    # Build complete offline HTML
    offline_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
{head_content}
  <style>
    /* ═══════════════════════════════════════════════════════════════ */
    /* IUPAC Chemistry App - Offline Version */
    /* Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} */
    /* ═══════════════════════════════════════════════════════════════ */
{css_content}
  </style>
  <meta name="offline-version" content="1.0">
  <meta name="build-date" content="{datetime.now().isoformat()}">
</head>
<body>
{body_content}
  <script>
{offline_js}
  </script>
</body>
</html>"""
    
    # Save offline HTML
    output_file = 'IUPAC_Offline.html'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(offline_html)
    
    size_mb = os.path.getsize(output_file) / (1024 * 1024)
    size_kb = os.path.getsize(output_file) / 1024
    
    if size_mb > 1:
        print(f"✅ Offline HTML created: {output_file} ({size_mb:.2f} MB)")
    else:
        print(f"✅ Offline HTML created: {output_file} ({size_kb:.2f} KB)")
    
    return output_file

def create_modular_zip():
    """Create a zip with all files (for when people want to modify)"""
    
    print("\n📦 Creating modular distribution package...")
    
    zip_name = 'IUPAC_Chemistry_Modular.zip'
    
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Add main files
        zf.write('index.html')
        zf.write('styles.css')
        zf.write('script.js')
        zf.write('molecules.json')
        zf.write('README.md')
        
        # Add documentation
        if os.path.exists('QUICKSTART.md'):
            zf.write('QUICKSTART.md')
        
        print(f"  ✓ Added application files")
        print(f"  ✓ Added documentation")
    
    size_mb = os.path.getsize(zip_name) / (1024 * 1024)
    print(f"✅ Modular package created: {zip_name} ({size_mb:.2f} MB)")
    
    return zip_name

def create_offline_zip(offline_html):
    """Create a zip with the standalone offline version"""
    
    print("\n📦 Creating standalone offline package...")
    
    zip_name = 'IUPAC_Chemistry_Offline.zip'
    
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Add standalone HTML as main entry point
        zf.write(offline_html, arcname='IUPAC_Chemistry_Offline.html')
        
        # Add documentation
        if os.path.exists('README.md'):
            zf.write('README.md', arcname='README.txt')
        
        # Add a simple launch guide
        launch_guide = """═══════════════════════════════════════════════════════════
  IUPAC Chemistry Offline Version
═══════════════════════════════════════════════════════════

✨ This is a fully self-contained application!

📖 HOW TO USE:
   1. Open "IUPAC_Chemistry_Offline.html" in any web browser
   2. No internet connection needed
   3. All 184 chemistry compounds are included

🎯 FEATURES:
   ✓ Search by name, formula, or SMILES
   ✓ View 3D molecular structures
   ✓ Multiple 2D projections (skeletal, wedge-dash, etc.)
   ✓ Quiz mode with scoring
   ✓ Dark/light theme
   ✓ Download structure files
   ✓ Works offline completely

⌨️  KEYBOARD SHORTCUTS:
   / = Focus search
   ↑/↓ = Navigate molecules
   Enter = Copy name
   Esc = Clear/Close

💾 DATA PERSISTENCE:
   Your quiz scores and bookmarks are saved locally
   (even after closing the browser)

🔒 PRIVACY:
   No data leaves your computer
   All processing happens in your browser

═══════════════════════════════════════════════════════════
Enjoy studying organic chemistry! 🧪
═══════════════════════════════════════════════════════════
"""
        zf.writestr('START_HERE.txt', launch_guide)
        
        print(f"  ✓ Added standalone HTML")
        print(f"  ✓ Added documentation")
        print(f"  ✓ Added launch guide")
    
    size_mb = os.path.getsize(zip_name) / (1024 * 1024)
    print(f"✅ Offline package created: {zip_name} ({size_mb:.2f} MB)")
    
    return zip_name

def main():
    """Main build process"""
    
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  IUPAC Chemistry App - Offline Build Generator             ║")
    print("║  Building self-contained versions for offline use          ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print()
    
    # Build offline HTML
    offline_html = create_offline_html()
    
    # Create packages
    modular_zip = create_modular_zip()
    offline_zip = create_offline_zip(offline_html)
    
    print()
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  ✅ BUILD COMPLETE                                         ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print()
    print("📁 Generated Files:")
    print(f"   1. {offline_html}")
    print(f"      → Single file, fully self-contained")
    print(f"      → Just open in browser, no setup needed")
    print()
    print(f"   2. {offline_zip}")
    print(f"      → Standalone package for distribution")
    print(f"      → Includes launch guide")
    print()
    print(f"   3. {modular_zip}")
    print(f"      → Source files for customization")
    print(f"      → Edit and rebuild as needed")
    print()
    print("🌐 For GitHub Pages:")
    print("   → Commit and push all files")
    print("   → Enable GitHub Pages in repository settings")
    print("   → Set source to 'main' or 'master' branch")
    print()
    print("📥 For Offline Distribution:")
    print("   → Share IUPAC_Chemistry_Offline.zip")
    print("   → Or upload IUPAC_Offline.html directly")
    print()

if __name__ == '__main__':
    main()
