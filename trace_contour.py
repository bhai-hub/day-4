from PIL import Image

img = Image.open('assets/images/model-physician-vogue.png')
pixels = img.load()
w, h = img.size

print("Inspecting face coordinates:")
for y in range(400, 650, 20):
    # scan from right edge w-1 down to 500 to find first pixel with brightness > 50
    for x in range(w - 1, 500, -1):
        r, g, b = pixels[x, y][:3]
        br = (r + g + b) // 3
        if br > 50:
            print(f"y={y}: rightmost model pixel at x={x}, color=({r},{g},{b})")
            break

print("\nInspecting bun coordinates:")
for y in range(110, 300, 20):
    # find left and right bounds of bun
    lx, rx = None, None
    for x in range(350, 750):
        r, g, b = pixels[x, y][:3]
        br = (r + g + b) // 3
        # bun is dark hair [0..75, 0..75, 0..75], background is beige on left [130..200] and dark slate on right [30..45]
        if lx is None and br < 80 and r < 85 and g < 80:
            lx = x
    for x in range(750, 400, -1):
        r, g, b = pixels[x, y][:3]
        br = (r + g + b) // 3
        # bun right edge: hair has texture [48..75] vs background [28..38]
        if br > 45 or r > 48:
            rx = x
            break
    print(f"y={y}: bun from x={lx} to x={rx}")
