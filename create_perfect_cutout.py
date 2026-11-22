from PIL import Image, ImageFilter, ImageDraw

img = Image.open('assets/images/model-physician-vogue.png').convert('RGBA')
w, h = img.size

# High-resolution polygon contour of the model's exact silhouette
# Trace coordinates clockwise:
# Start at top of hair bun -> down right side of bun -> forehead -> nose -> lips -> chin -> front of white coat -> bottom edge -> bottom-left of white coat -> back shoulder -> collar -> pearl earring & ear -> left side of bun -> back to top

points = [
    # Top of hair bun
    (485, 120),
    (515, 110),
    (545, 108),
    (575, 115),
    (605, 130),
    (625, 155),
    (630, 185),
    (625, 215),
    (615, 240),
    (620, 260),
    
    # Back of head into forehead
    (645, 275),
    (685, 300),
    (725, 330),
    (755, 360),
    (775, 385),
    (780, 405), # Temple
    (780, 435), # Forehead / brow
    (778, 460), # Nose bridge
    (776, 485), # Nose tip
    (768, 510), # Under nose
    (758, 530), # Upper lip
    (748, 550), # Lower lip
    (745, 570), # Chin
    (730, 600), # Jawline
    (710, 625),
    (695, 650), # Neck front
    (675, 675),
    (655, 705),
    
    # White coat front lapel & chest
    (635, 735),
    (620, 765),
    (615, 800),
    (625, 840),
    (642, 870),
    (648, 910),
    (652, 950),
    (655, 1000),
    (658, 1060),
    (660, 1120),
    (660, 1152), # Bottom-right of coat
    
    # Bottom edge of coat
    (60, 1152),  # Bottom-left of coat
    
    # White coat back contour going up
    (68, 1120),
    (75, 1070),
    (83, 1020),
    (95, 960),
    (110, 910),
    (130, 860),
    (155, 815),  # Shoulder blade curve
    (185, 775),
    (225, 730),
    (275, 690),
    (315, 650),
    (335, 620),  # Coat collar back
    (345, 590),
    (365, 560),
    (385, 535),  # Neck back
    (405, 510),
    (420, 485),
    
    # Ear and Pearl Drop Earring (crucial!)
    (440, 480),
    (455, 485),
    (475, 495),  # Pearl drop bottom
    (485, 475),
    (485, 440),
    (475, 410),  # Ear lobe
    (455, 380),  # Upper ear
    (440, 360),
    
    # Left side of hair & bun
    (435, 330),
    (430, 300),
    (425, 270),
    (420, 240),
    (422, 210),
    (430, 180),
    (440, 155),
    (460, 135)
]

# Create a clean antialiased mask
mask = Image.new('L', (w, h), 0)
draw = ImageDraw.Draw(mask)
draw.polygon(points, fill=255)

# Refine with pixel color validation:
# If a pixel inside the polygon is actually beige background on the left (r > 120, r - b > 20, g - b > 10, brightness > 115)
# or dark slate on the right (brightness < 45 and not inside dark hair), knock it out.
pixels = img.load()
mask_pixels = mask.load()

for y in range(h):
    for x in range(w):
        if mask_pixels[x, y] == 255:
            r, g, b, _ = pixels[x, y]
            br = (r + g + b) // 3
            # Check if left edge inadvertently included beige wall
            if x < 400 and y > 350 and (r > 125 and r - b > 20 and g - b > 10 and br > 115):
                mask_pixels[x, y] = 0
            # Check if right edge inadvertently included dark slate
            elif x > 640 and y > 700 and br < 50:
                mask_pixels[x, y] = 0
            elif x > 620 and y < 270 and br < 42:
                mask_pixels[x, y] = 0

# Soft 2px Gaussian blur for natural studio edge feathering
feathered_mask = mask.filter(ImageFilter.GaussianBlur(radius=2.0))

# Composite
isolated = Image.new('RGBA', (w, h), (0, 0, 0, 0))
isolated.paste(img, (0, 0), feathered_mask)

out_file = r'assets/images/model-physician-isolated.png'
isolated.save(out_file, 'PNG')
print(f"Generated pixel-perfect isolated model cutout: {out_file}")
