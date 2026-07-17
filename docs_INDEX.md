# IUPAC Chemistry Vocabulary Companion

🧪 A modern, interactive exam companion for organic chemistry students studying IUPAC nomenclature.

## 🌐 Live Demo

**[→ Open the App Online →](https://elonuziel.github.io/IUPAC_Vocabulary_Project/)**

## 📥 Download Offline Version

Choose your preferred format:

- **[Standalone HTML](https://github.com/elonuziel/IUPAC_Vocabulary_Project/releases)** - Single file, no setup needed
- **[Complete Package (.zip)](https://github.com/elonuziel/IUPAC_Vocabulary_Project/releases)** - Includes documentation

## ✨ Features

### 🔍 Smart Search
- Search by IUPAC name, molecular formula, or SMILES notation
- Real-time highlighting
- Filter by 16 chemistry categories

### 🎨 Interactive Visualization
- **3D Molecular Viewer** - WebGL-powered 3D structures with rotation, zoom, and style controls
- **Multiple 2D Projections** - Skeletal, wedge-dash, Fischer, Newman, Lewis structures
- **High-Quality Structures** - Generated from RDKit with accurate stereochemistry

### 🎓 Quiz Mode
- Interactive flash card-style quiz
- Persistent scoring (tracks correct/incorrect)
- Name reveal on click
- Real-time statistics

### 🌙 Theme Support
- Dark mode (perfect for late-night studying)
- Light mode (for printing)
- Smooth theme transitions

### 💾 Smart Features
- **Bookmarks** - Star your favorite molecules
- **Offline Mode** - Download and use completely offline
- **Persistent Data** - Scores and bookmarks saved locally
- **Keyboard Shortcuts** - Fast navigation (/, arrows, Enter, Esc)

### 📊 Coverage

Contains **184 IUPAC nomenclature examples** including:
- 60 Alkanes
- 48 Alkenes
- 22 Alkynes
- 76 Haloalkanes
- 30 Stereoisomers
- And more...

Organized by 16 chemistry categories:
Stereochemistry, Haloalkane, Alkene, Alkyne, Cyclic, Aromatic, Alcohol, Ether, Carboxylic Acid, Ester, Amide, Anhydride, Alkane, Aldehyde, Ketone, Other

## 🚀 Quick Start

### Online (No Setup)
Just visit: https://elonuziel.github.io/IUPAC_Vocabulary_Project/

### Offline (Download & Use)
1. Download `IUPAC_Offline.html` or `IUPAC_Chemistry_Offline.zip`
2. Extract if needed
3. Open `IUPAC_Chemistry_Offline.html` in any web browser
4. No internet connection needed ✓

### Local Development
```bash
# Clone repository
git clone https://github.com/elonuziel/IUPAC_Vocabulary_Project.git
cd IUPAC_Vocabulary_Project

# Run local server
python -m http.server 8000

# Open in browser
# Visit: http://localhost:8000
```

## 📖 Documentation

- [Quick Start Guide](QUICKSTART.md) - Get started in seconds
- [Complete README](README.md) - Full feature documentation
- [Refactoring Details](REFACTORING_COMPLETE.md) - Code structure overview

## 🎯 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Visualization**: [3Dmol.js](https://3Dmol.org/) for 3D rendering
- **Data Format**: JSON for easy updates
- **Icons**: SVG molecules from RDKit
- **Deployment**: GitHub Pages (static hosting)

## 🔄 Build Process

Generate offline versions automatically:

```bash
# Create standalone HTML and packages
python build_offline.py
```

Outputs:
- `IUPAC_Offline.html` - Single self-contained file (~6 MB)
- `IUPAC_Chemistry_Offline.zip` - Distribution package
- `IUPAC_Chemistry_Modular.zip` - Source files for customization

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search input |
| `↑` / `↓` | Navigate between molecules |
| `Enter` | Copy selected IUPAC name |
| `Esc` | Clear search / Close sidebar |

## 📋 Project Structure

```
IUPAC_Vocabulary_Project/
├── index.html              # Web app entry point
├── styles.css              # All styling (organized)
├── script.js               # Application logic
├── molecules.json          # 184 molecules database
├── README.md               # Complete documentation
├── QUICKSTART.md           # Quick start guide
├── build_offline.py        # Build script for offline versions
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions automation
```

## 🔒 Privacy & Offline

This application:
- ✅ Works completely offline
- ✅ Stores data locally (browser storage only)
- ✅ No external API calls (except CDN for 3Dmol.js)
- ✅ No analytics or tracking
- ✅ No account required

## 🐛 Support

Found a bug or have a suggestion?
- [Open an Issue](https://github.com/elonuziel/IUPAC_Vocabulary_Project/issues)
- [Start a Discussion](https://github.com/elonuziel/IUPAC_Vocabulary_Project/discussions)

## 📄 License

This project is available for educational use.

## 🙏 Credits

- **3Dmol.js** - 3D molecular viewer
- **RDKit** - Chemical structure rendering
- **Google Fonts** - Typography (Outfit, Inter, Fira Code)

---

**Made with ❤️ for organic chemistry students**

### Getting Started

1. **[Use Online →](https://elonuziel.github.io/IUPAC_Vocabulary_Project/)** (No download needed)
2. **[Download Offline →](https://github.com/elonuziel/IUPAC_Vocabulary_Project/releases)** (Use anywhere)
3. **[View Source →](https://github.com/elonuziel/IUPAC_Vocabulary_Project)** (Modify if needed)
