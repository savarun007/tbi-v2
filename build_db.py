import os
import json
import imagehash
from PIL import Image

# Configuration
IMAGE_DIR = 'reference_images'
OUTPUT_FILE = 'image_hashes.json'

# Categories based on your folder names
CATEGORIES = [
    'epidural', 
    'intraparenchymal', 
    'intraventricular', 
    'ne', 
    'subarachnoid',
    'subdural'  # Make sure this folder exists!
]

def build_database():
    database = {}
    total_images = 0
    
    print(f"🚀 Starting to build memory from {IMAGE_DIR}...")

    if not os.path.exists(IMAGE_DIR):
        print(f"❌ Error: Directory '{IMAGE_DIR}' not found.")
        return

    for category in CATEGORIES:
        class_dir = os.path.join(IMAGE_DIR, category)
        if not os.path.exists(class_dir):
            print(f"⚠️ Warning: Folder '{category}' not found. Skipping.")
            continue
            
        print(f"   Processing {category}...")
        
        for filename in os.listdir(class_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                filepath = os.path.join(class_dir, filename)
                try:
                    with Image.open(filepath) as img:
                        # Compute Perceptual Hash (pHash)
                        # pHash is excellent for finding similar images despite resizing/minor edits
                        h = str(imagehash.phash(img))
                        
                        # Store in database: Hash -> Label
                        # We use the hash as the key for fast lookups later if needed,
                        # but for "closest match" we will iterate keys.
                        database[h] = category
                        total_images += 1
                except Exception as e:
                    print(f"   ❌ Could not process {filename}: {e}")

    with open(OUTPUT_FILE, 'w') as f:
        json.dump(database, f, indent=4)

    print(f"✅ Success! Saved {total_images} fingerprints to {OUTPUT_FILE}")

if __name__ == "__main__":
    build_database()