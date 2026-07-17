import json

with open('molecules.json', 'r', encoding='utf-8') as f:
    molecules = json.load(f)

print(f'Total molecules: {len(molecules)}')
print(f'\nSample molecule (ID 1):')
mol = molecules[0]
for key in ['id', 'original_name', 'categories', 'formula', 'weight', 'has_sdf', 'has_pymol']:
    print(f'  {key}: {mol.get(key, "N/A")}')

print(f'\nMolecule fields available:')
for field in mol.keys():
    value = mol[field]
    if isinstance(value, str):
        print(f'  ✓ {field}: {len(value)} chars')
    else:
        print(f'  ✓ {field}: {type(value).__name__}')

# Verify categories in use
all_categories = set()
for mol in molecules:
    for cat in mol.get('categories', []):
        all_categories.add(cat)

print(f'\nCategories in use:')
for cat in sorted(all_categories):
    count = sum(1 for m in molecules if cat in m.get('categories', []))
    print(f'  {cat}: {count}')
