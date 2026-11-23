import os
import csv
from PIL import Image, ImageDraw, ImageFont

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data"))
IMAGES_DIR = os.path.join(DATA_DIR, "images")
MANIFEST_PATH = os.path.join(DATA_DIR, "manifest.csv")

CATEGORIES = ["wallet", "phone", "bag", "bottle", "keys", "electronics", "clothing", "documents", "other"]

# 60 true match pairs (120 items total: 40 text-only, 40 image-only, 40 hybrid)
PAIRS = [
    # 20 Text-Only Pairs (Pair 1 - 20)
    ("Black leather wallet with credit cards", "Found black men's wallet near cafeteria", "wallet", "text", (30, 30, 30)),
    ("iPhone 13 with cracked glass screen", "Apple iPhone with cracked front screen on bus", "phone", "text", (40, 40, 60)),
    ("Blue gym backpack with Nike logo", "Blue Nike sports bag in gym locker area", "bag", "text", (20, 60, 150)),
    ("Silver stainless steel water bottle", "Metal silver thermos flask found in auditorium", "bottle", "text", (180, 180, 190)),
    ("Toyota car key with leather fob", "Electronic car remote key on parking bench", "keys", "text", (50, 50, 50)),
    ("Sony WH-1000XM4 black headphones", "Black over-ear Bluetooth headphones in study hall", "electronics", "text", (20, 20, 20)),
    ("Brown corduroy jacket size L", "Men brown winter jacket on classroom coat hook", "clothing", "text", (120, 70, 30)),
    ("Student university ID card Jane Smith", "Student identification card found in hallway", "documents", "text", (220, 220, 240)),
    ("Green ceramic coffee mug", "Green travel mug left in computer lab", "other", "text", (40, 130, 60)),
    ("Red leather handbag", "Red color bag left under library chair", "bag", "text", (190, 30, 30)),
    ("Apple MacBook Air charger 30W", "White USB-C laptop power adapter in library", "electronics", "text", (240, 240, 240)),
    ("Black reading glasses with silver frame", "Prescription spectacles in black case", "other", "text", (60, 60, 60)),
    ("Samsung Galaxy S22 olive green", "Green Samsung Android smartphone in canteen", "phone", "text", (70, 100, 70)),
    ("Grey knit woolen scarf", "Winter grey woolen muffler on campus bench", "clothing", "text", (140, 140, 140)),
    ("Passport in brown leather holder", "Travel passport document found near entrance gate", "documents", "text", (100, 60, 20)),
    ("Bicycle lock keys with yellow tag", "Set of brass padlock keys with yellow plastic tag", "keys", "text", (200, 180, 30)),
    ("Hydro Flask wide mouth yellow bottle", "Yellow insulated water container on sports field", "bottle", "text", (230, 190, 40)),
    ("Logitech wireless presenter clicker", "Black slide presentation remote in seminar room", "electronics", "text", (30, 30, 30)),
    ("Black bifold cardholder with ID window", "Slim black card pouch found at ATM kiosk", "wallet", "text", (25, 25, 25)),
    ("Graphing calculator TI-84 Plus", "Texas Instruments scientific calculator in math dept", "electronics", "text", (70, 70, 90)),

    # 20 Image-Only Pairs (Pair 21 - 40)
    ("Black leather bifold wallet", "Black bifold pocket wallet", "wallet", "image", (25, 25, 25)),
    ("Smartphone with red case", "Red phone protective case", "phone", "image", (180, 30, 40)),
    ("Dark blue school backpack", "Navy canvas student rucksack", "bag", "image", (30, 50, 120)),
    ("White plastic water sipper", "Translucent sports bottle", "bottle", "image", (230, 230, 240)),
    ("Gold brass house keys", "Brass door keys bundle", "keys", "image", (210, 170, 50)),
    ("White wireless in-ear earbuds", "Wireless earphone charging case", "electronics", "image", (245, 245, 245)),
    ("Blue denim jeans jacket", "Denim vintage outerwear", "clothing", "image", (60, 90, 140)),
    ("Blue driver license card", "Identification card badge", "documents", "image", (100, 140, 200)),
    ("Black compact umbrella", "Foldable black rain umbrella", "other", "image", (20, 20, 20)),
    ("Red clutch purse", "Small red party purse", "bag", "image", (200, 40, 40)),
    ("Black wireless computer mouse", "Ergonomic black USB mouse", "electronics", "image", (40, 40, 40)),
    ("Tortoise shell sunglasses", "Brown designer sun glasses", "other", "image", (110, 70, 40)),
    ("Silver iPad tablet 10 inch", "Apple iPad with silver backing", "electronics", "image", (190, 190, 200)),
    ("Black baseball cap with white logo", "Cotton athletic ballcap", "clothing", "image", (25, 25, 30)),
    ("Spiral bound college notebook", "A4 ruled paper notebook", "documents", "image", (220, 210, 180)),
    ("Bike chain key with blue tag", "Small locker key ring", "keys", "image", (40, 100, 200)),
    ("Purple stainless tumbler", "Violet insulated thermos cup", "bottle", "image", (120, 40, 140)),
    ("Black portable power bank", "External USB battery charger", "electronics", "image", (35, 35, 35)),
    ("Brown leather coin pouch", "Vintage brown leather purse", "wallet", "image", (130, 80, 40)),
    ("Digital wristwatch with black strap", "Electronic sports watch", "other", "image", (30, 30, 30)),

    # 20 Hybrid Pairs (Pair 41 - 60)
    ("Black men leather wallet containing cards", "Black leather wallet found near library", "wallet", "hybrid", (30, 30, 30)),
    ("iPhone 14 midnight blue in clear case", "Blue Apple phone with clear bumper case", "phone", "hybrid", (20, 40, 80)),
    ("Red and black Nike gym bag", "Red sport duffel bag left in locker", "bag", "hybrid", (170, 30, 30)),
    ("Blue and black sipper bottle", "Blue sipper water bottle found in court", "bottle", "hybrid", (30, 80, 160)),
    ("Honda car remote key with red lanyard", "Car key fob with red fabric strap", "keys", "hybrid", (180, 40, 40)),
    ("Bose QuietComfort black headphones", "Black noise cancelling over-ear headphones", "electronics", "hybrid", (25, 25, 25)),
    ("Black North Face fleece jacket", "Black zip-up fleece jacket in cafeteria", "clothing", "hybrid", (20, 20, 20)),
    ("Student university library card", "Laminated library registration card", "documents", "hybrid", (200, 220, 240)),
    ("Brown sunglasses in hard leather case", "Brown polarized shades in case", "other", "hybrid", (100, 60, 30)),
    ("Orange canvas tote bag with books", "Orange cotton shopping tote on stairs", "bag", "hybrid", (220, 100, 20)),
    ("Dell 65W barrel pin laptop charger", "Black Dell notebook power supply adapter", "electronics", "hybrid", (40, 40, 40)),
    ("Metal silver ballpoint pen engraved", "Engraved metallic silver executive pen", "other", "hybrid", (190, 190, 195)),
    ("Google Pixel 7 lemongrass green", "Pale green Android phone found on bench", "phone", "hybrid", (180, 200, 140)),
    ("Knitted yellow beanie hat", "Yellow winter knit skullcap in lecture hall", "clothing", "hybrid", (230, 190, 30)),
    ("Government identity national card", "Official ID card badge in leather sleeve", "documents", "hybrid", (210, 210, 220)),
    ("Set of 3 Yale brass padlock keys", "Three brass door keys on steel ring", "keys", "hybrid", (200, 170, 40)),
    ("Contigo pink travel coffee tumbler", "Pink insulated thermal travel mug", "bottle", "hybrid", (210, 90, 130)),
    ("Kindle Paperwhite e-reader in black cover", "Amazon Kindle reader with black flip case", "electronics", "hybrid", (30, 30, 30)),
    ("Tan leather bifold wallet with cash", "Brown tan wallet with paper currency inside", "wallet", "hybrid", (150, 100, 50)),
    ("Black folding umbrella with curved handle", "Classic black umbrella with wooden hook handle", "other", "hybrid", (20, 20, 20))
]

def generate_image(filepath, text, bg_color):
    img = Image.new("RGB", (224, 224), color=bg_color)
    draw = ImageDraw.Draw(img)
    # Draw simple visual motif
    draw.rectangle([20, 20, 204, 204], outline=(255, 255, 255), width=2)
    # Add textual label in image center
    draw.text((30, 100), text[:20], fill=(255, 255, 255))
    img.save(filepath, format="JPEG", quality=85)

def main():
    os.makedirs(IMAGES_DIR, exist_ok=True)
    rows = []

    for i, (lost_desc, found_desc, category, input_type, color) in enumerate(PAIRS, 1):
        pair_id = f"PAIR_{i:03d}"

        # Lost Item
        lost_img_name = f"lost_{i:03d}.jpg" if input_type in ["image", "hybrid"] else ""
        if lost_img_name:
            generate_image(os.path.join(IMAGES_DIR, lost_img_name), f"Lost {category}", color)

        lost_text = lost_desc if input_type in ["text", "hybrid"] else ""

        # Found Item
        found_img_name = f"found_{i:03d}.jpg" if input_type in ["image", "hybrid"] else ""
        if found_img_name:
            # slightly varied shade for visual realistic match
            varied_color = tuple(min(255, max(0, c + 15)) for c in color)
            generate_image(os.path.join(IMAGES_DIR, found_img_name), f"Found {category}", varied_color)

        found_text = found_desc if input_type in ["text", "hybrid"] else ""

        rows.append({
            "pair_id": pair_id,
            "category": category,
            "input_type": input_type,
            "is_match": 1,
            "lost_id": f"L_{i:03d}",
            "lost_text": lost_text,
            "lost_image": lost_img_name,
            "found_id": f"F_{i:03d}",
            "found_text": found_text,
            "found_image": found_img_name
        })

    # Add negative (non-match) test pairs for accurate evaluation of TN and FP
    # By shuffling found items against lost items of different categories
    for i in range(len(PAIRS)):
        neg_idx = (i + 13) % len(PAIRS)
        lost_row = rows[i]
        found_row = rows[neg_idx]

        if lost_row["category"] != found_row["category"]:
            neg_pair_id = f"NEG_{i+1:03d}"
            rows.append({
                "pair_id": neg_pair_id,
                "category": lost_row["category"],
                "input_type": lost_row["input_type"],
                "is_match": 0,
                "lost_id": lost_row["lost_id"],
                "lost_text": lost_row["lost_text"],
                "lost_image": lost_row["lost_image"],
                "found_id": found_row["found_id"],
                "found_text": found_row["found_text"],
                "found_image": found_row["found_image"]
            })

    with open(MANIFEST_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "pair_id", "category", "input_type", "is_match",
            "lost_id", "lost_text", "lost_image",
            "found_id", "found_text", "found_image"
        ])
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated {len(rows)} evaluation records in {MANIFEST_PATH}")
    print(f"Sample images saved in {IMAGES_DIR}")

if __name__ == "__main__":
    main()
