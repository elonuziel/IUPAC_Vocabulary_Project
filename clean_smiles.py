"""
Strip stereo notation from stored SMILES.
Re-generates each molecule's SMILES with isomericSmiles=False so that
@, /, \, and unnecessary [] are removed from the display.
"""
import sys, re, json
sys.stdout.reconfigure(encoding='utf-8')
from rdkit import Chem

HTML = r"C:\Users\elon\documents\uni\chemistry\אורגנית\IUPAC_Searchable_Vocabulary.html"

with open(HTML, 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'const molecules\s*=\s*(\[.*?\]);', html, re.DOTALL)
db = json.loads(m.group(1))

cleaned = 0
failed  = 0
for mol_data in db:
    smi = mol_data.get('smiles')
    if not smi:
        continue
    try:
        rdmol = Chem.MolFromSmiles(smi)
        if rdmol:
            mol_data['smiles'] = Chem.MolToSmiles(rdmol, isomericSmiles=False)
            cleaned += 1
        else:
            failed += 1
    except Exception as e:
        print(f"  Error #{mol_data['id']}: {e}")
        failed += 1

print(f"Cleaned {cleaned} SMILES, {failed} failures")

# Write back using index-based splice (safe)
new_decl = f"const molecules = {json.dumps(db, ensure_ascii=False)};"
updated  = html[:m.start()] + new_decl + html[m.end():]

with open(HTML, 'w', encoding='utf-8') as f:
    f.write(updated)

print("Done. Sample:")
for mol in db[:3]:
    print(f"  #{mol['id']}: {mol.get('smiles','N/A')}")
