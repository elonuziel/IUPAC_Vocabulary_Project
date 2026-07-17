import os
import re
import json
import math
from rdkit import Chem
from rdkit.Chem import rdDepictor
from rdkit.Chem.Draw import rdMolDraw2D
from rdkit.Chem import rdMolDescriptors

# Workspace Paths
workspace_dir = r"C:\Users\elon\documents\uni\chemistry\אורגנית"
html_path = os.path.join(workspace_dir, "IUPAC_Searchable_Vocabulary.html")

# Helper to normalize 2D vectors
def normalize_vec(x, y):
    d = math.sqrt(x*x + y*y)
    if d == 0:
        return (0, 0)
    return (x/d, y/d)

# Helper to rotate 2D vector
def rotate_vec(x, y, angle_deg):
    rad = math.radians(angle_deg)
    cos_a = math.cos(rad)
    sin_a = math.sin(rad)
    return (cos_a * x - sin_a * y, sin_a * x + cos_a * y)

# 1. Condensed Formula Generator
def get_condensed_formula(mol):
    if not mol:
        return ""
    
    # Simple rule-based condensed formula generator for acyclic structures
    # Find the longest carbon chain
    # We will identify all carbon atoms
    carbons = [a.GetIdx() for a in mol.GetAtoms() if a.GetSymbol() == 'C']
    if not carbons:
        return mol.GetFormula() if hasattr(mol, 'GetFormula') else ""
    
    # If the structure has rings (like cyclohexanes or cyclobutanes)
    if Chem.GetSSSR(mol):
        # Return simplified molecular formula with substituent highlights
        formula = rdMolDescriptors.CalcMolFormula(mol)
        return formula

    # Find paths between all pairs of carbons to find the longest chain
    longest_path = []
    for i in range(len(carbons)):
        for j in range(i+1, len(carbons)):
            paths = Chem.GetShortestPath(mol, carbons[i], carbons[j])
            if len(paths) > len(longest_path):
                longest_path = paths
                
    if not longest_path:
        longest_path = carbons[:1]

    # Helper to get the formula of a substituent sub-tree
    def get_substituent_formula(start_idx, parent_idx):
        visited = {parent_idx, start_idx}
        
        def traverse(curr_idx):
            atom = mol.GetAtomWithIdx(curr_idx)
            sym = atom.GetSymbol()
            
            # Count implicit hydrogens
            hs = atom.GetTotalNumHs()
            h_str = f"H{hs}" if hs > 1 else ("H" if hs == 1 else "")
            
            sub_parts = []
            for nbr in atom.GetNeighbors():
                n_idx = nbr.GetIdx()
                if n_idx not in visited:
                    visited.add(n_idx)
                    sub_parts.append(traverse(n_idx))
                    
            sub_str = "".join(sub_parts)
            if sub_str:
                return f"{sym}{h_str}({sub_str})"
            return f"{sym}{h_str}"
            
        return traverse(start_idx)

    # Walk along the longest carbon chain
    parts = []
    chain_set = set(longest_path)
    
    for i, idx in enumerate(longest_path):
        atom = mol.GetAtomWithIdx(idx)
        sym = atom.GetSymbol()
        hs = atom.GetTotalNumHs()
        
        # Get side groups attached to this carbon
        side_groups = []
        for nbr in atom.GetNeighbors():
            n_idx = nbr.GetIdx()
            if n_idx not in chain_set:
                side_groups.append(get_substituent_formula(n_idx, idx))
                
        h_str = f"H{hs}" if hs > 1 else ("H" if hs == 1 else "")
        
        # Format carbon unit
        side_str = "".join([f"({g})" if len(g) > 1 and not g.startswith("(") else g for g in side_groups])
        parts.append(f"{sym}{h_str}{side_str}")
        
    return "".join(parts)

# 2. RDKit SVG Generator (Skeletal, Wedge-Dash, Full Structural)
def generate_rdkit_svg(mol, mode):
    d_mol = Chem.Mol(mol)
    
    if mode == 'skeletal':
        # Remove stereochemistry flags for flat skeletal representation
        Chem.RemoveStereochemistry(d_mol)
    
    # Assign 2D coordinates
    rdDepictor.Compute2DCoords(d_mol)
    
    # Determine size
    drawer = rdMolDraw2D.MolDraw2DSVG(400, 300)
    opts = drawer.drawOptions()
    opts.clearBackground = False
    
    if mode == 'full':
        # Add explicit hydrogens
        d_mol = Chem.AddHs(d_mol)
        rdDepictor.Compute2DCoords(d_mol)
        opts.explicitMethyl = True
        
    drawer.DrawMolecule(d_mol)
    drawer.FinishDrawing()
    return drawer.GetDrawingText()

# 3. Lewis Structure SVG Generator (Puts lone pairs on heteroatoms)
def generate_lewis_svg(mol):
    # Start with full structural SVG
    full_mol = Chem.AddHs(mol)
    rdDepictor.Compute2DCoords(full_mol)
    
    drawer = rdMolDraw2D.MolDraw2DSVG(400, 300)
    opts = drawer.drawOptions()
    opts.clearBackground = False
    opts.explicitMethyl = True
    
    drawer.DrawMolecule(full_mol)
    drawer.FinishDrawing()
    svg_text = drawer.GetDrawingText()
    
    # Add lone pairs as overlay elements in SVG
    overlay_svg = ""
    conf = full_mol.GetConformer()
    
    for atom in full_mol.GetAtoms():
        sym = atom.GetSymbol()
        if sym in ['O', 'N', 'F', 'Cl', 'Br', 'I']:
            idx = atom.GetIdx()
            # Get SVG coordinates of the atom
            pt = drawer.GetDrawCoords(idx)
            cx, cy = pt.x, pt.y
            
            # Find bond vectors connected to this atom
            bond_vectors = []
            for nbr in atom.GetNeighbors():
                nbr_idx = nbr.GetIdx()
                nbr_pt = drawer.GetDrawCoords(nbr_idx)
                bx = nbr_pt.x - cx
                by = nbr_pt.y - cy
                ux, uy = normalize_vec(bx, by)
                bond_vectors.append((ux, uy))
                
            # If no bonds (should not happen), default direction
            if not bond_vectors:
                bond_vectors = [(0, 1)]
                
            # Sum bond vectors to find the opposite direction
            sum_x = sum(v[0] for v in bond_vectors)
            sum_y = sum(v[1] for v in bond_vectors)
            opp_x, opp_y = normalize_vec(-sum_x, -sum_y)
            if opp_x == 0 and opp_y == 0:
                opp_x, opp_y = (0, -1) # default up
                
            # Distance of lone pairs from atom center
            R = 12.0
            dot_color = "#ff4757" # stand out red dots
            
            # Helper to draw a pair of dots along a direction
            def draw_pair(dir_x, dir_y):
                # Center of the pair
                px = cx + R * dir_x
                py = cy + R * dir_y
                # Perpendicular direction
                perp_x, perp_y = -dir_y, dir_x
                # Two dots
                d1x, d1y = px + 2.0 * perp_x, py + 2.0 * perp_y
                d2x, d2y = px - 2.0 * perp_x, py - 2.0 * perp_y
                return (f'<circle cx="{d1x:.2f}" cy="{d1y:.2f}" r="1.8" fill="{dot_color}" />'
                        f'<circle cx="{d2x:.2f}" cy="{d2y:.2f}" r="1.8" fill="{dot_color}" />')
            
            # Place lone pairs based on element
            if sym == 'N':
                # 1 lone pair opposite to bonds
                overlay_svg += draw_pair(opp_x, opp_y)
            elif sym == 'O':
                # 2 lone pairs at +/- 35 degrees from opposite direction
                dir1_x, dir1_y = rotate_vec(opp_x, opp_y, 35)
                dir2_x, dir2_y = rotate_vec(opp_x, opp_y, -35)
                overlay_svg += draw_pair(dir1_x, dir1_y)
                overlay_svg += draw_pair(dir2_x, dir2_y)
            elif sym in ['F', 'Cl', 'Br', 'I']:
                # 3 lone pairs: directly opposite, and +/- 60 degrees
                dir1_x, dir1_y = opp_x, opp_y
                dir2_x, dir2_y = rotate_vec(opp_x, opp_y, 60)
                dir3_x, dir3_y = rotate_vec(opp_x, opp_y, -60)
                overlay_svg += draw_pair(dir1_x, dir1_y)
                overlay_svg += draw_pair(dir2_x, dir2_y)
                overlay_svg += draw_pair(dir3_x, dir3_y)
                
    # Insert lone pairs before closing </svg> tag
    if overlay_svg:
        svg_text = svg_text.replace("</svg>", f"{overlay_svg}</svg>")
        
    return svg_text

# 4. Fischer Projection SVG Generator
def generate_fischer_svg(mol, original_name):
    chiral_centers = Chem.FindMolChiralCenters(mol, includeUnassigned=True)
    if not chiral_centers:
        return None
    
    num_centers = len(chiral_centers)
    if num_centers > 4:
        return None
        
    width, height = 400, 300
    if num_centers == 2:
        height = 360
    elif num_centers > 2:
        height = 420
        
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%">'
    svg += '<rect width="100%" height="100%" fill="none" />'
    
    style = 'font-family: "Fira Code", monospace; font-size: 13px; font-weight: bold; fill: var(--text-primary); text-anchor: middle;'
    line_color = 'var(--text-secondary)'
    
    centers_y = []
    start_y = 80
    spacing = 70
    
    for i in range(num_centers):
        centers_y.append(start_y + i * spacing)
        
    v_top = start_y - 30
    v_bot = start_y + (num_centers - 1) * spacing + 30
    svg += f'<line x1="200" y1="{v_top}" x2="200" y2="{v_bot}" stroke="{line_color}" stroke-width="2.5" />'
    
    for idx, (atom_idx, config) in enumerate(chiral_centers):
        cy = centers_y[idx]
        svg += f'<line x1="120" y1="{cy}" x2="280" y2="{cy}" stroke="{line_color}" stroke-width="2.5" />'
        
        atom = mol.GetAtomWithIdx(atom_idx)
        nbrs = [nbr for nbr in atom.GetNeighbors()]
        
        h_nbrs = []
        v_nbrs = []
        for nbr in nbrs:
            sym = nbr.GetSymbol()
            if sym in ['H', 'F', 'Cl', 'Br', 'I', 'O']:
                h_nbrs.append(nbr)
            else:
                v_nbrs.append(nbr)
                
        while len(h_nbrs) < 2:
            h_nbrs.append(None)
            
        labels = []
        for nbr in h_nbrs:
            if nbr is None:
                labels.append("H")
            else:
                sym = nbr.GetSymbol()
                if sym == 'O':
                    labels.append("OH")
                else:
                    labels.append(sym)
                    
        left_lbl, right_lbl = labels[0], labels[1]
        
        if config == 'S':
            left_lbl, right_lbl = right_lbl, left_lbl
            
        svg += f'<text x="100" y="{cy+4}" style="{style}">{left_lbl}</text>'
        svg += f'<text x="300" y="{cy+4}" style="{style}">{right_lbl}</text>'
        
    top_label = "CH3"
    bottom_label = "CH2CH3" if num_centers == 1 else "CH3"
    
    name_lower = original_name.lower()
    if "acid" in name_lower:
        top_label = "COOH"
    elif "butanol" in name_lower or "propanol" in name_lower:
        top_label = "CH2OH"
        
    svg += f'<text x="200" y="{v_top - 12}" style="{style}">{top_label}</text>'
    svg += f'<text x="200" y="{v_bot + 20}" style="{style}">{bottom_label}</text>'
    svg += '</svg>'
    return svg

# 5. Newman Projection SVG Generator
def generate_newman_svg(mol, original_name):
    bonds = []
    for bond in mol.GetBonds():
        if bond.GetBondType() == Chem.BondType.SINGLE:
            a1 = bond.GetBeginAtom()
            a2 = bond.GetEndAtom()
            if a1.GetSymbol() == 'C' and a2.GetSymbol() == 'C':
                bonds.append((a1.GetIdx(), a2.GetIdx()))
                
    if not bonds:
        return None
        
    c1, c2 = bonds[len(bonds)//2]
    
    subs1 = [nbr for nbr in mol.GetAtomWithIdx(c1).GetNeighbors() if nbr.GetIdx() != c2]
    subs2 = [nbr for nbr in mol.GetAtomWithIdx(c2).GetNeighbors() if nbr.GetIdx() != c1]
    
    while len(subs1) < 3:
        subs1.append(None)
    while len(subs2) < 3:
        subs2.append(None)
        
    def get_sub_label(nbr):
        if nbr is None:
            return "H"
        sym = nbr.GetSymbol()
        if sym == 'C':
            return "CH3" if nbr.GetTotalNumHs() == 3 else "CH2CH3"
        elif sym == 'O':
            return "OH"
        return sym

    labels_front = [get_sub_label(s) for s in subs1[:3]]
    labels_back = [get_sub_label(s) for s in subs2[:3]]
    
    width, height = 400, 300
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%">'
    svg += '<rect width="100%" height="100%" fill="none" />'
    
    style = 'font-family: "Fira Code", monospace; font-size: 13px; font-weight: bold; fill: var(--text-primary); text-anchor: middle;'
    line_color = 'var(--text-secondary)'
    cx, cy = 200, 140
    r_circle = 45
    
    svg += f'<circle cx="{cx}" cy="{cy}" r="{r_circle}" fill="none" stroke="{line_color}" stroke-width="2.5" />'
    
    back_angles = [30, 150, 270]
    back_lbl_pos = []
    for a in back_angles:
        rad = math.radians(a)
        x1 = cx + r_circle * math.cos(rad)
        y1 = cy - r_circle * math.sin(rad)
        x2 = cx + (r_circle + 25) * math.cos(rad)
        y2 = cy - (r_circle + 25) * math.sin(rad)
        svg += f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{line_color}" stroke-width="2" />'
        
        lx = cx + (r_circle + 40) * math.cos(rad)
        ly = cy - (r_circle + 40) * math.sin(rad)
        back_lbl_pos.append((lx, ly))
        
    front_angles = [90, 210, 330]
    front_lbl_pos = []
    for a in front_angles:
        rad = math.radians(a)
        x2 = cx + (r_circle + 20) * math.cos(rad)
        y2 = cy - (r_circle + 20) * math.sin(rad)
        svg += f'<line x1="{cx}" y1="{cy}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{line_color}" stroke-width="2.5" />'
        
        lx = cx + (r_circle + 35) * math.cos(rad)
        ly = cy - (r_circle + 35) * math.sin(rad)
        front_lbl_pos.append((lx, ly))
        
    svg += f'<circle cx="{cx}" cy="{cy}" r="5" fill="{line_color}" />'
    
    for idx, (lx, ly) in enumerate(front_lbl_pos):
        svg += f'<text x="{lx:.1f}" y="{ly+4:.1f}" style="{style}">{labels_front[idx]}</text>'
    for idx, (lx, ly) in enumerate(back_lbl_pos):
        svg += f'<text x="{lx:.1f}" y="{ly+4:.1f}" style="{style}">{labels_back[idx]}</text>'
        
    svg += '</svg>'
    return svg

# 6. Chair & Boat Conformation SVG (for the 5 Cyclohexanes)
def generate_chair_boat_svgs(original_name, is_chair=True):
    name_lower = original_name.lower()
    
    sub_1 = "H"
    sub_2 = "H"
    sub_3 = "H"
    
    if "propyl" in name_lower and "chloro" in name_lower:
        sub_1 = "Cl"
        sub_2 = "C3H7"
    elif "ethyl" in name_lower and "chloro" in name_lower:
        sub_1 = "C2H5"
        sub_2 = "Cl"
        sub_3 = "I"
        
    width, height = 400, 300
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%">'
    svg += '<rect width="100%" height="100%" fill="none" />'
    
    style = 'font-family: "Fira Code", monospace; font-size: 12px; font-weight: bold; fill: var(--text-primary); text-anchor: middle;'
    line_color = 'var(--text-secondary)'
    
    if is_chair:
        pts = [
            (120, 110), # C1
            (170, 95),  # C2
            (230, 125), # C3
            (280, 110), # C4
            (230, 160), # C5
            (170, 140)  # C6
        ]
        svg += f'<path d="M {pts[0][0]},{pts[0][1]} L {pts[1][0]},{pts[1][1]} L {pts[2][0]},{pts[2][1]} L {pts[3][0]},{pts[3][1]} L {pts[4][0]},{pts[4][1]} L {pts[5][0]},{pts[5][1]} Z" fill="none" stroke="{line_color}" stroke-width="3" stroke-linejoin="round" />'
        
        svg += f'<line x1="{pts[0][0]}" y1="{pts[0][1]}" x2="{pts[0][0]}" y2="{pts[0][1]+25}" stroke="{line_color}" stroke-width="1.8" />'
        svg += f'<text x="{pts[0][0]}" y="{pts[0][1]+38}" style="{style}">{sub_1}</text>'
        svg += f'<line x1="{pts[0][0]}" y1="{pts[0][1]}" x2="{pts[0][0]-22}" y2="{pts[0][1]-12}" stroke="{line_color}" stroke-width="1.8" />'
        svg += f'<text x="{pts[0][0]-32}" y="{pts[0][1]-12}" style="{style}">H</text>'
        
        svg += f'<line x1="{pts[3][0]}" y1="{pts[3][1]}" x2="{pts[3][0]}" y2="{pts[3][1]-25}" stroke="{line_color}" stroke-width="1.8" />'
        svg += f'<text x="{pts[3][0]}" y="{pts[3][1]-32}" style="{style}">{sub_2}</text>'
        svg += f'<line x1="{pts[3][0]}" y1="{pts[3][1]}" x2="{pts[3][0]+22}" y2="{pts[3][1]+12}" stroke="{line_color}" stroke-width="1.8" />'
        svg += f'<text x="{pts[3][0]+32}" y="{pts[3][1]+18}" style="{style}">H</text>'
        
        if sub_3 != "H":
            svg += f'<line x1="{pts[1][0]}" y1="{pts[1][1]}" x2="{pts[1][0]}" y2="{pts[1][1]-22}" stroke="{line_color}" stroke-width="1.8" />'
            svg += f'<text x="{pts[1][0]}" y="{pts[1][1]-29}" style="{style}">{sub_3}</text>'
            svg += f'<line x1="{pts[2][0]}" y1="{pts[2][1]}" x2="{pts[2][0]}" y2="{pts[2][1]+22}" stroke="{line_color}" stroke-width="1.8" />'
            svg += f'<text x="{pts[2][0]}" y="{pts[2][1]+34}" style="{style}">I</text>'
            
    else:
        pts = [
            (120, 100), # C1
            (170, 140), # C2
            (230, 140), # C3
            (280, 100), # C4
            (210, 95),  # C5
            (150, 95)   # C6
        ]
        svg += f'<path d="M {pts[0][0]},{pts[0][1]} L {pts[1][0]},{pts[1][1]} L {pts[2][0]},{pts[2][1]} L {pts[3][0]},{pts[3][1]} L {pts[4][0]},{pts[4][1]} L {pts[5][0]},{pts[5][1]} Z" fill="none" stroke="{line_color}" stroke-width="3" stroke-linejoin="round" />'
        
        svg += f'<line x1="{pts[0][0]}" y1="{pts[0][1]}" x2="{pts[0][0]+15}" y2="{pts[0][1]-20}" stroke="{line_color}" stroke-width="1.8" />'
        svg += f'<text x="{pts[0][0]+25}" y="{pts[0][1]-24}" style="{style}">{sub_1}</text>'
        
        svg += f'<line x1="{pts[3][0]}" y1="{pts[3][1]}" x2="{pts[3][0]-15}" y2="{pts[3][1]-20}" stroke="{line_color}" stroke-width="1.8" />'
        svg += f'<text x="{pts[3][0]-25}" y="{pts[3][1]-24}" style="{style}">{sub_2}</text>'
        
    svg += '</svg>'
    return svg

# Main Compilation Pipeline
def main():
    print("Reading HTML file...")
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Extract molecules database
    db_match = re.search(r'const molecules\s*=\s*(\[.*?\]);', content, re.DOTALL)
    if not db_match:
        raise ValueError("Could not extract molecules database from HTML file")
        
    db_str = db_match.group(1)
    # Sanitize backslashes in SMILES
    db_str = re.sub(r'\\(?!n|"|\\)', r'\\\\', db_str)
    molecules_db = json.loads(db_str, strict=False)
    
    print(f"Loaded {len(molecules_db)} molecules. Generating 2D views...")
    
    for idx, mol_data in enumerate(molecules_db):
        smiles = mol_data.get('smiles')
        original_name = mol_data.get('original_name', '')
        
        mol_data['condensed'] = ""
        mol_data['skeletal_svg'] = None
        mol_data['wedgedash_svg'] = None
        mol_data['full_svg'] = None
        mol_data['lewis_svg'] = None
        mol_data['fischer_svg'] = None
        mol_data['newman_svg'] = None
        mol_data['chair_svg'] = None
        mol_data['boat_svg'] = None
        
        if smiles:
            try:
                mol = Chem.MolFromSmiles(smiles)
                if mol:
                    mol_data['condensed'] = get_condensed_formula(mol)
                    mol_data['skeletal_svg'] = generate_rdkit_svg(mol, 'skeletal')
                    mol_data['wedgedash_svg'] = generate_rdkit_svg(mol, 'wedgedash')
                    mol_data['full_svg'] = generate_rdkit_svg(mol, 'full')
                    mol_data['lewis_svg'] = generate_lewis_svg(mol)
                    mol_data['fischer_svg'] = generate_fischer_svg(mol, original_name)
                    mol_data['newman_svg'] = generate_newman_svg(mol, original_name)
                    
                    if 'cyclohexane' in original_name.lower():
                        mol_data['chair_svg'] = generate_chair_boat_svgs(original_name, is_chair=True)
                        mol_data['boat_svg'] = generate_chair_boat_svgs(original_name, is_chair=False)
                        
            except Exception as e:
                print(f"Error on molecule #{mol_data['id']} ({original_name}): {e}")
                
        if (idx + 1) % 20 == 0:
            print(f"Processed {idx + 1}/{len(molecules_db)} molecules...")
            
    # Serialize the updated database
    print("Writing updated database back to HTML...")
    new_db_str = json.dumps(molecules_db, ensure_ascii=False)
    
    # Safe replacement using string replace (bypasses re.sub backslash parsing)
    original_decl = db_match.group(0) # "const molecules = [...];"
    new_decl = f"const molecules = {new_db_str};"
    updated_content = content.replace(original_decl, new_decl)
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)
        
    print("Compilation completed successfully!")

if __name__ == "__main__":
    main()
