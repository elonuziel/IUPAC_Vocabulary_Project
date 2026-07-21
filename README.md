# IUPAC Vocabulary Companion - Project Structure

A refactored, maintainable version of my organic chemistry IUPAC exam companion.

# online version at https://elonuziel.github.io/IUPAC_Vocabulary_Project/

## 📁 New File Structure

```
IUPAC_Vocabulary_Project/
├── index.html              ✅ Clean HTML - UI markup only
├── styles.css              ✅ All styling - organized with comments
├── script.js               ✅ All JavaScript - well-commented sections
├── molecules.json          ✅ Data file - easy to update
├── structures/             (existing directories)
│   ├── images/
│   ├── sdf/
│   └── sessions/
└── README.md              (this file)
```

## 🎯 Why This Structure?

**Before:** 1 massive HTML file (3000+ lines)  
**Now:** 4 focused files, each with a clear purpose

### Benefits:
- ✅ **Easy to maintain**: Find what you need quickly
- ✅ **Update data separately**: Edit `molecules.json` without touching code
- ✅ **Cache-friendly**: CSS and JS stay separate for browser caching
- ✅ **Readable code**: Clear section comments in each file
- ✅ **No build tools needed**: Just open `index.html` in browser

---

## 📝 File Overview

### `index.html` - UI Markup
- Clean semantic HTML
- References external CSS and JS
- Zero inline styles
- Data attributes instead of inline `onclick` handlers
- No embedded data

### `styles.css` - All Styling
Organized into sections with comments:
- Theme variables (light/dark)
- Header, search, filters
- Molecule cards, detail sidebar
- 3D/2D viewer styles
- Responsive design (768px, 1024px breakpoints)
- Quiz mode, animations

### `script.js` - Main Logic
Organized into clear sections:
- **Constants**: Categories, element colors
- **Global State**: Search, filters, 3D viewer
- **DOM Cache**: All element references
- **Initialization**: `init()` function
- **Rendering**: `renderMolecules()`, `selectMolecule()`
- **3D Viewer**: `applyViewerStyle()`, `updateMoleculeRepresentation()`
- **Download**: Snapshot functions
- **Quiz Mode**: Quiz logic and scoring
- **Event Listeners**: All interactions centralized
- **Utilities**: Copy, toast, helpers

### `molecules.json` - Data
```json
[
  {
    "id": 1,
    "original_name": "(1E,3E)-1,2-dibromo-3-methyl-1-hexene",
    "cid": null,
    "categories": ["Alkene", "Haloalkane"],
    "formula": "C7H12Br2",
    "weight": "255.98",
    "smiles": "...",
    "has_sdf": true,
    "has_pymol": true,
    "sdf_content": "",
    "skeletal_svg": "",
    "wedgedash_svg": "",
    "lewis_svg": "",
    "full_svg": "",
    "fischer_svg": "",
    "newman_svg": "",
    "chair_svg": "",
    "boat_svg": "",
    "condensed": ""
  }
]
```

---

## 🚀 How to Use

### **1. View the App**
Just open `index.html` in your browser. The app will:
- Load `molecules.json` automatically
- Load `styles.css` for styling
- Load `script.js` for functionality

### **2. Update Molecules**
Edit `molecules.json` to add/remove/modify molecules. Format:
- Keep the structure consistent
- Populate SVG fields with actual SVG content from your Python script
- Populate `sdf_content` with actual SDF data

### **3. Modify Styling**
Edit `styles.css`. Everything is in one place:
- Theme colors at the top (`:root` variables)
- Each section has a comment header
- Search for `.class-name` to find styling

### **4. Change JavaScript Logic**
Edit `script.js`. Sections are clearly marked:
- Search for `// ── SECTION NAME` comments
- Each major function has a comment block
- Event listeners are all at the bottom

### **5. Running Locally**
```bash
# Simple HTTP server (Python 3)
python -m http.server 8000

# Then visit: http://localhost:8000
```

---

## 🔄 How to Populate Data from Your Python Script

Your Python script should output `molecules.json` with this structure:

```python
import json

molecules = [
    {
        "id": 1,
        "original_name": "...",
        "cic": None,
        "categories": ["Alkene", "Haloalkane"],
        "formula": "C7H12Br2",
        "weight": "255.98",
        "smiles": "...",
        "has_sdf": True,
        "has_pymol": True,
        "sdf_content": "...",  # Full SDF data
        "skeletal_svg": "<svg>...</svg>",
        "wedgedash_svg": "<svg>...</svg>",
        # ... other 2D representations
    }
]

with open("molecules.json", "w") as f:
    json.dump(molecules, f, indent=2)
```

---

## ✨ Features Maintained

All original features still work:
- 🔍 Search by name, formula, SMILES, category
- 🎨 Dark/light theme toggle
- 📊 Stats dashboard
- 🌟 Star/bookmark molecules
- 🎓 Quiz mode with scoring
- 📹 3D viewer with spin/style controls
- 🖼️ Multiple 2D projections (Fischer, Newman, Chair, etc.)
- 💾 Download PNG snapshots
- 📋 Copy IUPAC names
- ⌨️ Keyboard shortcuts (/, arrows, Enter, Esc)
- 📱 Responsive design

---

## 🎓 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `↓` / `↑` | Navigate molecules |
| `Enter` | Copy selected name |
| `Esc` | Clear/close |

---

## 🔧 Development Tips

### Adding New Features
1. Add styling to `styles.css` with a clear comment
2. Add JavaScript logic to appropriate section in `script.js`
3. Add HTML structure to `index.html` if needed
4. Test in browser

### Debugging
- Open browser DevTools (F12)
- Check console for errors
- Look for detailed comments in code

### Performance
- SVGs are embedded in JSON (cached in browser)
- 3Dmol.js is loaded from CDN
- Images lazy-loaded on demand

---

## 📋 Maintenance Checklist

- [ ] `molecules.json` updated with new molecules
- [ ] `styles.css` has consistent color scheme
- [ ] `script.js` has no inline styles
- [ ] All event listeners use proper selectors
- [ ] Test responsive design on mobile
- [ ] Test dark/light theme toggle
- [ ] Test quiz mode
- [ ] Verify 3D molecules render

---

## 🐛 Common Issues & Solutions

**Q: Changes to CSS/JS don't appear**  
A: Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)

**Q: Molecules don't load**  
A: Check console. Make sure `molecules.json` is in same folder.

**Q: 3D viewer is black**  
A: The SDF data might be empty. Check `sdf_content` field in JSON.

**Q: Quiz mode doesn't work**  
A: Make sure quiz buttons have proper IDs. Check console for errors.

---

## 📞 Notes for Future You

- All colors use CSS variables (search `:root`)
- Mobile breakpoints: 768px, 1024px
- Font stack: Outfit (headers), Inter (body), Fira Code (mono)
- 3Dmol.js handles 3D rendering
- localStorage stores: theme, starred IDs, quiz score

---

**Last Updated:** July 2026  
**Total Molecules:** Loaded from `molecules.json`  
**Responsive:** Yes (Desktop, Tablet, Mobile)
