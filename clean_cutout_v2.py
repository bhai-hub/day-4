from PIL import Image, ImageFilter

img = Image.open('assets/images/model-physician-vogue.png').convert('RGBA')
w, h = img.size
pixels = img.load()

# Create mask: 255 = model, 0 = background
# Start with all 255
mask = Image.new('L', (w, h), 255)
mask_pixels = mask.load()

# 1. Flood fill left background (warm beige wall)
# Start from x=0 for all y
from collections import deque

queue = deque()
visited = set()

for y in range(h):
    queue.append((0, y))
    visited.add((0, y))

def is_beige_wall(x, y):
    if x >= 460 and y < 600:
        # Cannot be beige wall past the ear/head
        return False
    r, g, b, _ = pixels[x, y]
    br = (r + g + b) // 3
    # Beige wall properties:
    # 1. Brightness between 95 and 230
    # 2. Warm tint: r > g and g >= b and r - b >= 14
    # 3. Not white coat (white coat has b >= r - 8 or cool tone)
    # 4. Not dark hair (hair br < 80)
    # 5. Not skin (skin has strong pink/red r - g > 30 and r > 130)
    if br < 90 or br > 235:
        return False
    if r - b < 14:
        return False
    if r < g:
        return False
    return True

while queue:
    cx, cy = queue.popleft()
    mask_pixels[cx, cy] = 0

    for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
        nx, ny = cx + dx, cy + dy
        if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
            visited.add((nx, ny))
            if is_beige_wall(nx, ny):
                queue.append((nx, ny))

print(f"Beige wall flood-filled: {len(visited)} pixels")

# 2. Flood fill right background (dark charcoal wall)
queue_right = deque()
visited_right = set()

for y in range(h):
    queue_right.append((w - 1, y))
    visited_right.add((w - 1, y))

def is_charcoal_wall(x, y):
    # Vogue watermark area in bottom right
    if x >= 635 and y >= 750:
        return True
    # Model's face/hair:
    # Model begins where brightness > 52 or r > 55
    r, g, b, _ = pixels[x, y]
    br = (r + g + b) // 3
    # Charcoal wall is very dark (br <= 46) and neutral (|r-g| <= 7 and |g-b| <= 7)
    if br > 47:
        return False
    if r > 50 or g > 50 or b > 48:
        return False
    return True

while queue_right:
    cx, cy = queue_right.popleft()
    mask_pixels[cx, cy] = 0

    for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
        nx, ny = cx + dx, cy + dy
        if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited_right:
            visited_right.add((nx, ny))
            if is_charcoal_wall(nx, ny):
                queue_right.append((nx, ny))

print(f"Charcoal wall flood-filled: {len(visited_right)} pixels")

# 3. Everything above bun top (y < 112) is background
for y in range(112):
    for x in range(w):
        mask_pixels[x, y] = 0

# 4. Refine right of bun: between y=112 and y=260, x > 640 is charcoal background
for y in range(112, 260):
    for x in range(635, w):
        mask_pixels[x, y] = 0

# 5. Smooth the mask edge using Gaussian blur (radius=1.8) for clean alpha edge
smooth_mask = mask.filter(ImageFilter.GaussianBlur(radius=1.8))

# Composite
isolated = Image.new('RGBA', (w, h), (0, 0, 0, 0))
isolated.paste(img, (0, 0), smooth_mask)

out_file = r'assets/images/model-physician-isolated.png'
isolated.save(out_file, 'PNG')
print(f"Saved refined isolated model cutout: {out_file}")
