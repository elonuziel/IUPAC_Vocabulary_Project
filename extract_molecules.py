import json
import re

# Read the original HTML file
with open("IUPAC_Searchable_Vocabulary.html", "r", encoding="utf-8") as f:
    content = f.read()

# Extract the molecules array using regex
match = re.search(r'const molecules = (\[.*?\]);', content, re.DOTALL)

if match:
    json_str = match.group(1)
    try:
        # Parse the JSON
        molecules = json.loads(json_str)
        
        # Save to molecules.json
        with open("molecules.json", "w", encoding="utf-8") as f:
            json.dump(molecules, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Successfully extracted {len(molecules)} molecules")
        print(f"First molecule: {molecules[0]['original_name']}")
        print(f"Last molecule: {molecules[-1]['original_name']}")
        print("✅ Saved to molecules.json")
    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Error: {e}")
        print(f"First 500 chars: {json_str[:500]}")
else:
    print("❌ Could not find molecules array in HTML")
