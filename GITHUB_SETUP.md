# GitHub Pages & Release Setup Guide

This guide will help you:
1. Enable GitHub Pages for your repository
2. Set up automatic builds for offline versions
3. Create releases for easy distribution

## 📖 Quick Setup

### Step 1: Enable GitHub Pages

1. Go to your GitHub repository: https://github.com/elonuziel/IUPAC_Vocabulary_Project
2. Click **Settings** (top menu)
3. Left sidebar → **Pages**
4. Under "Build and deployment":
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select `master` (or `main` if that's your default)
   - **Folder**: Select `/ (root)`
5. Click **Save**

✅ Your site is now live at: `https://elonuziel.github.io/IUPAC_Vocabulary_Project/`

### Step 2: Automatic Builds (GitHub Actions)

The `.github/workflows/deploy.yml` workflow will:
- ✅ Run on every push to master/main
- ✅ Build offline versions automatically
- ✅ Upload artifacts for download
- ✅ Deploy to GitHub Pages

**No additional setup needed!** The workflow is already configured.

### Step 3: Create Releases

To create a release with downloadable offline versions:

```bash
# Create a new tag
git tag v1.0.0

# Push the tag to GitHub
git push origin v1.0.0
```

This will:
1. Trigger the build workflow
2. Create a GitHub Release
3. Attach the offline files to the release
4. Make them available for download

## 🎯 What You Get

After pushing commits and tags:

### 📄 On GitHub Pages
- Live web app: `https://elonuziel.github.io/IUPAC_Vocabulary_Project/`
- All features available online
- Mobile responsive
- Works on any device

### 📦 As Artifacts (After Each Push)
- Build artifacts available for 90 days
- Found in "Actions" tab → Latest workflow run
- Download offline versions

### 📥 As Releases (After Tags)
- Permanent downloadable versions
- Create release notes
- Upload multiple file formats
- Semantic versioning friendly

## 📁 What Gets Built

### `IUPAC_Offline.html` (~5.9 MB)
- Single self-contained file
- All CSS, JS, and data embedded
- Works completely offline
- Just open in browser

### `IUPAC_Chemistry_Offline.zip` (~0.57 MB)
- Standalone package
- Includes launch guide
- Perfect for distribution
- Easy to share

### `IUPAC_Chemistry_Modular.zip` (~0.58 MB)
- Source files
- For customization
- Separate CSS, JS, JSON
- For developers

## 🚀 Workflow Details

### Automatic Triggers
The GitHub Action runs when:
- Push to `master` or `main` branch
- Manual trigger (Actions → Deploy → Run workflow)
- Weekly schedule (Sundays at midnight UTC)
- Changes to key files (HTML, CSS, JS, JSON)

### Build Steps
1. Checkout code
2. Set up Python
3. Run `build_offline.py`
4. Upload artifacts
5. Deploy to GitHub Pages
6. (Optionally) Create release if tag

## 📊 Live URL

Your application will be available at:

```
https://elonuziel.github.io/IUPAC_Vocabulary_Project/
```

Share this link with:
- Study groups
- Chemistry teachers
- Online forums
- Social media

## 🔄 Updating the App

To update the app:

```bash
# Make changes to your files
# (e.g., add molecules, fix bugs, update UI)

# Commit and push
git add .
git commit -m "Update: add new molecules"
git push origin master
```

That's it! GitHub Actions will:
1. Automatically rebuild
2. Update GitHub Pages
3. Create new artifacts
4. All within 1-2 minutes

## 📋 Folder Structure for GitHub

```
IUPAC_Vocabulary_Project/
├── index.html              ← GitHub Pages will serve this
├── styles.css
├── script.js
├── molecules.json
├── README.md               ← GitHub Pages shows this
├── _config.yml             ← Jekyll configuration
├── build_offline.py        ← Build script
├── .github/
│   └── workflows/
│       └── deploy.yml      ← GitHub Actions config
└── structures/
    ├── images/
    ├── sdf/
    └── sessions/
```

## 🔐 Repository Settings (Optional)

For best results, you might want to:

1. **Enable GitHub Pages**
   - Settings → Pages → Deploy from branch

2. **Enforce Signing Commits** (optional)
   - Settings → Repository → Signing commits

3. **Add Branch Protection** (optional)
   - Settings → Branches → Add rule for `master`

4. **Add Repository Topics** (optional)
   - Add: `chemistry`, `education`, `iupac-nomenclature`, `organic-chemistry`

## 📝 Creating Release Notes

When you create a release:

```markdown
## IUPAC Chemistry App v1.0.0

🎉 Initial release of the comprehensive IUPAC nomenclature study tool!

### ✨ Features
- 184 molecules with full nomenclature
- 3D interactive molecular viewer
- Multiple 2D projections
- Quiz mode with scoring
- Offline support

### 📥 Downloads
- **IUPAC_Offline.html** - Single file (~5.9 MB)
- **IUPAC_Chemistry_Offline.zip** - Complete package (~0.57 MB)
- **IUPAC_Chemistry_Modular.zip** - Source files (~0.58 MB)

### 🚀 How to Use
1. Download any file above
2. Open HTML file in web browser
3. Start learning!

[📖 View Documentation](https://github.com/elonuziel/IUPAC_Vocabulary_Project#readme)
```

## ✅ Verification Checklist

- [ ] GitHub Pages is enabled
- [ ] Repository has Actions enabled
- [ ] `.github/workflows/deploy.yml` exists
- [ ] `_config.yml` exists
- [ ] `index.html` is at repository root
- [ ] Build script runs without errors
- [ ] Offline files are generated
- [ ] GitHub Pages site loads
- [ ] App is fully functional online

## 🆘 Troubleshooting

### Pages not showing up
- Wait 30 seconds after enabling
- Hard refresh browser (Ctrl+Shift+R)
- Check the Pages section again

### Build fails in GitHub Actions
- Check the Actions tab for error details
- Ensure Python 3.11+ is available
- Verify `build_offline.py` syntax is correct

### Files not appearing in release
- Tags must start with `v` (e.g., `v1.0.0`)
- Push the tag: `git push origin v1.0.0`
- Check GitHub Actions tab

### Offline HTML is too large
- It's normal to be ~5.9 MB (all molecules + SVGs embedded)
- Zip files are smaller (~0.57 MB)
- Both work the same

## 🎯 Next Steps

1. **Verify GitHub Pages**: https://elonuziel.github.io/IUPAC_Vocabulary_Project/
2. **Test offline version**: Download `IUPAC_Offline.html`
3. **Create first release**: `git tag v1.0.0 && git push origin v1.0.0`
4. **Share with others**: Copy the GitHub Pages URL

## 📞 Support

For help with:
- **GitHub Pages**: https://docs.github.com/en/pages
- **GitHub Actions**: https://docs.github.com/en/actions
- **This project**: Check the README.md

---

**You're all set!** Your app is now live and automatically deployable. 🚀✨
