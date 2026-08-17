from PIL import Image
import numpy as np

input_path = r"C:\Users\pavan\OneDrive\Desktop\UXI_Works\bakefactory_uxi\public\logo.png"
output_path = r"C:\Users\pavan\OneDrive\Desktop\UXI_Works\bakefactory_uxi\public\logo.png"

img = Image.open(input_path).convert("RGBA")
data = np.array(img, dtype=np.float32)

r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

# BFS flood fill from all 4 corners to detect background region
from collections import deque

height, width = img.size[1], img.size[0]
visited = np.zeros((height, width), dtype=bool)
mask = np.zeros((height, width), dtype=bool)

THRESHOLD = 220  # pixels brighter than this in all channels = background candidate

def is_background(y, x):
    return (r[y,x] >= THRESHOLD and g[y,x] >= THRESHOLD and b[y,x] >= THRESHOLD)

queue = deque()

# Seed all edge pixels
for x in range(width):
    if is_background(0, x): queue.append((0, x))
    if is_background(height-1, x): queue.append((height-1, x))
for y in range(height):
    if is_background(y, 0): queue.append((y, 0))
    if is_background(y, width-1): queue.append((y, width-1))

while queue:
    y, x = queue.popleft()
    if y < 0 or y >= height or x < 0 or x >= width:
        continue
    if visited[y, x]:
        continue
    visited[y, x] = True
    if not is_background(y, x):
        continue
    mask[y, x] = True
    queue.append((y+1, x))
    queue.append((y-1, x))
    queue.append((y, x+1))
    queue.append((y, x-1))

# Apply mask — make background pixels fully transparent
data[:,:,3] = np.where(mask, 0, data[:,:,3])

result = Image.fromarray(data.astype(np.uint8), "RGBA")
result.save(output_path, "PNG")
print("Done! Background removed cleanly.")
