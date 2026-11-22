from PIL import Image

img = Image.open('assets/images/model-physician-vogue.png')
pixels = img.load()
w, h = img.size

print("Inspecting lower body coordinates (y=640 to 1150):")
for y in range(640, 1152, 30):
    # Left edge: scan from 0 to 400
    lx = None
    for x in range(0, 450):
        r, g, b = pixels[x, y][:3]
        # beige bg has r > 110, r - b > 16
        is_bg = (r > 105 and r - b > 15 and g - b > 5)
        if not is_bg:
            lx = x
            break

    # Right edge: scan from x=750 down to 400 (avoid Vogue watermark which is at x > 650, y > 850)
    rx = None
    search_start = 740 if y < 850 else 660
    for x in range(search_start, 400, -1):
        r, g, b = pixels[x, y][:3]
        br = (r + g + b) // 3
        # white coat has br > 58
        if br > 58 or (r > 60 and b > 50):
            rx = x
            break
    print(f"y={y}: left={lx}, right={rx}")
