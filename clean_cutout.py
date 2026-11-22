import os
from PIL import Image, ImageFilter, ImageOps, ImageDraw

img_path = r'assets/images/model-physician-vogue.png'
img = Image.open(img_path).convert('RGBA')
w, h = img.size
print(f"Loaded image: {w}x{h}")

# Create grayscale mask (0 = background, 255 = model)
mask = Image.new('L', (w, h), 0)
pixels = img.load()
mask_pixels = mask.load()

# Let's inspect rows and classify
for y in range(h):
    if y < 112:
        # Above bun
        continue

    # 1. Left boundary:
    # y < 350: Hair bun
    # y 350..530: Ear, pearl earring, cheek
    # y >= 530: White coat back
    left_x = None
    if y < 350:
        # Hair bun on left: hair is dark (R < 80, G < 80, B < 80)
        # Background is beige (R > 110, G > 90)
        for x in range(350, 600):
            r, g, b, _ = pixels[x, y]
            brightness = (r + g + b) // 3
            if brightness < 75 and r < 80 and g < 80:
                left_x = x
                break
    elif y < 530:
        # Ear / pearl earring / neck
        for x in range(340, 520):
            r, g, b, _ = pixels[x, y]
            brightness = (r + g + b) // 3
            # Earring pearl is bright white/silver, hair is dark, ear is skin tone
            # Beige background has R - B > 22 and R > 125
            is_beige_bg = (r > 120 and r - b > 20 and g - b > 8)
            if not is_beige_bg:
                left_x = x
                break
    else:
        # White coat
        for x in range(40, 450):
            r, g, b, _ = pixels[x, y]
            brightness = (r + g + b) // 3
            is_beige_bg = (r > 115 and r - b > 18 and g - b > 8)
            if not is_beige_bg:
                left_x = x
                break

    # 2. Right boundary:
    # y < 350: Hair bun on right
    # y 350..620: Face / cheek / nose / lips
    # y >= 620: Front of white coat (x < 650, cutting off Vogue logo)
    right_x = None
    if y < 350:
        for x in range(750, 450, -1):
            r, g, b, _ = pixels[x, y]
            # Dark background is <= 46 brightness
            if r > 48 or g > 48 or b > 45:
                right_x = x
                break
    elif y < 620:
        for x in range(880, 500, -1):
            r, g, b, _ = pixels[x, y]
            brightness = (r + g + b) // 3
            # Skin tone or hair: r > 55 and brightness > 50
            if (r > 60 and r > b + 10) or brightness > 52:
                right_x = x
                break
    else:
        # Front of white coat: max x is 645 (Vogue logo is at x >= 650)
        max_limit = min(645, w - 1)
        for x in range(max_limit, 400, -1):
            r, g, b, _ = pixels[x, y]
            brightness = (r + g + b) // 3
            # White coat: brightness > 62
            if brightness > 60 or (r > 55 and b > 48):
                right_x = x
                break

    if left_x is not None and right_x is not None and right_x > left_x:
        for x in range(left_x, right_x + 1):
            mask_pixels[x, y] = 255

# Post-process mask:
# 1. Fill any internal holes (e.g. hair bun reflections or shadowed seams)
# 2. Smooth the boundary using Gaussian blur to give a natural, soft photographic alpha edge
smooth_mask = mask.filter(ImageFilter.GaussianBlur(radius=1.8))

# Composite into final isolated PNG
isolated = Image.new('RGBA', (w, h), (0, 0, 0, 0))
isolated.paste(img, (0, 0), smooth_mask)

out_file = r'assets/images/model-physician-isolated.png'
isolated.save(out_file, 'PNG')
print(f"Saved pristine isolated cutout to: {out_file}")
