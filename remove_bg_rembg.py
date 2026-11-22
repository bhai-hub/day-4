from rembg import remove
from PIL import Image

input_path = 'assets/images/model-physician-vogue.png'
output_path = 'assets/images/model-physician-cutout.png'

print(f"Reading {input_path}...")
input_image = Image.open(input_path)
print("Removing background with AI matting...")
output_image = remove(input_image)
output_image.save(output_path)
print(f"Successfully saved pristine cutout to {output_path}!")
