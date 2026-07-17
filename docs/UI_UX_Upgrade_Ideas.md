# IUPAC Exam Companion - UI/UX Upgrade Roadmap

This document outlines potential future upgrades, features, and visual polish for the **Organic Chemistry IUPAC Exam Companion**. These ideas are designed to transform the searchable database into the ultimate active recall and stereochemistry study suite.

---

## 1. Active Recall & Exam Preparation
Tools focused directly on preparing for exams and self-testing.

- [ ] **Quiz Mode (Flashcard Style)**
  - *Description:* Hide IUPAC names in the list and show only the 3D models.
  - *UX:* Click or hover on a card to reveal its name. Add a score tracker (e.g., "Got it right" / "Need review").
- [ ] **Starred Favorites & Bookmark Deck**
  - *Description:* Add a bookmark/star icon next to each card to create custom study lists.
  - *UX:* A filter toggle for "Show Starred Only" at the top of the search bar.
- [ ] **2D Skeletal Structure Toggle**
  - *Description:* Render a 2D line drawing next to the 3D WebGL viewer.
  - *UX:* Helps map 2D formulas (standard on exams) to 3D conformations.
- [ ] **Stereochemistry Focus (R/S & E/Z)**
  - *Description:* Explicitly highlight and label chiral centers (R/S) and double-bond stereocenters (E/Z) in both the text details and the 3D model.

---

## 2. Interactive 3D Viewer Tools
Leveraging the WebGL canvas to provide scientific analysis tools.

- [ ] **Interactive Measure Tool**
  - *Description:* Click atoms in the 3D canvas to measure bond lengths and bond angles.
  - *UX:* 
    - Click 2 atoms $\rightarrow$ show bond distance in Ångstroms (Å).
    - Click 3 atoms $\rightarrow$ show bond angle (e.g., $109.5^\circ$ tetrahedral, $120^\circ$ planar).
  - *Value:* Highly visual tool for learning steric strain and hybridization.
- [ ] **Functional Group Pulsing/Highlighting**
  - *Description:* Highlight specific functional groups (e.g., $-OH$ for alcohols, $-O-$ for ethers, carbonyls) in the 3D model.
  - *UX:* Click a category badge in the sidebar to make that group glow or pulse with a specific color.
- [ ] **Advanced Rendering Options**
  - *Description:* Add toggles to switch camera projections (Orthographic vs. Perspective).
  - *UX:* Toggle custom rendering environments (pure white background for copy-pasting into notes, transparent background, or clean gridlines).

---

## 3. Visual & Aesthetic Polish
Premium interactions and design systems to create a modern web experience.

- [ ] **Dynamic Glassmorphic Detail Panel**
  - *Description:* Add frosted-glass effects (`backdrop-filter: blur()`) to sidebars and panels.
  - *UX:* Accent border gradients that glow based on the category of the selected compound (e.g., green for haloalkanes, red/pink for acids).
- [ ] **Satisfying Micro-Interactions**
  - *Description:* Add micro-animations to enhance user action feedback.
  - *UX:* 
    - Confetti or particle burst effect when clicking "Copy IUPAC Name".
    - Smooth skeleton loaders when searching.
    - Gentle "float" animation on selected 3D structures.
- [ ] **Structure-based Search & Filters**
  - *Description:* Add the ability to search by entering properties (e.g., "MW > 150", "formula: C7", "contains: Br").

---

> [!TIP]
> **PyMOL Sessions Integration**
> All of these upgrades will work directly alongside the existing PyMOL session (`.pse`) and structure (`.sdf`) download options, retaining the ability to open files in native desktop applications.

> [!NOTE]
> Feel free to select any of these features to implement next, or check them off as you modify the codebase!
