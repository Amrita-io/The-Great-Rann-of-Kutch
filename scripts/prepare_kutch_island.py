#!/usr/bin/env python3
"""
scripts/prepare_kutch_island.py: Studio-grade extraction, texture enhancement,
and 3D layer decomposition of the Kutch Floating Island Diorama.
"""

import os
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from scipy.ndimage import distance_transform_edt

INPUT_PATH = r"C:/Users/LENOVO/.gemini/antigravity/brain/37f85485-e477-4713-841f-957bc38f700e/.user_uploaded/media_1794248994831_3a37cd75.jpg"
OUTPUT_DIR = "public/assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. Load Image
img_bgr = cv2.imread(INPUT_PATH)
h, w = img_bgr.shape[:2]

# 2. Precise Background Difference
bg_bgr = np.array([16.6, 17.0, 17.0], dtype=np.float32)
diff = np.linalg.norm(img_bgr.astype(np.float32) - bg_bgr, axis=2)

# Connected components to isolate island + roots + floating debris
island_roi_mask = np.zeros((h, w), dtype=bool)
island_roi_mask[80:535, 235:795] = True

# Foreground mask
fg_mask = (diff > 8.0) & island_roi_mask

# Remove isolated noise outside island
fg_uint8 = fg_mask.astype(np.uint8)
num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(fg_uint8)

clean_mask = np.zeros((h, w), dtype=np.uint8)
for i in range(1, num_labels):
    area = stats[i, cv2.CC_STAT_AREA]
    cx, cy = centroids[i]
    if area >= 6 and (235 <= cx <= 790) and (82 <= cy <= 530):
        clean_mask[labels == i] = 255

# 3. Refined Anti-Aliased Alpha
# Distance transform to produce smooth 1.5px sub-pixel edge
dist_in = cv2.distanceTransform(clean_mask, cv2.DIST_L2, 3)
dist_out = cv2.distanceTransform(255 - clean_mask, cv2.DIST_L2, 3)

alpha = np.zeros((h, w), dtype=np.float32)
alpha[clean_mask == 255] = 1.0

# 1.5 pixel smooth transition
edge_band = (dist_in < 1.5) | (dist_out < 1.2)
alpha[edge_band] = np.clip((dist_in[edge_band] - dist_out[edge_band] + 0.8) / 1.6, 0.0, 1.0)

# 4. Color De-Fringing / Color Bleed
# Avoid dark edge fringe: bleed confident foreground colors (diff > 25) outwards
img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
confident_fg = (clean_mask == 255) & (diff > 25.0)

# Scipy EDT nearest-neighbor color bleed
_, (nearest_y, nearest_x) = distance_transform_edt(~confident_fg, return_indices=True)
bled_rgb = img_rgb[nearest_y, nearest_x]

# Blend confident interior with bled colors on the very outer boundary pixels
final_rgb = img_rgb.copy()
outer_rim = (dist_in < 1.8) & (clean_mask == 255)
blend_factor = np.clip((dist_in[outer_rim]) / 1.8, 0.0, 1.0)[:, np.newaxis]
final_rgb[outer_rim] = (img_rgb[outer_rim] * blend_factor + bled_rgb[outer_rim] * (1.0 - blend_factor)).astype(np.uint8)

alpha_uint8 = (alpha * 255.0).astype(np.uint8)

# 5. Crop to Bounding Box with Margin
y_indices, x_indices = np.where(clean_mask > 0)
pad = 16
x0 = max(0, x_indices.min() - pad)
x1 = min(w, x_indices.max() + pad)
y0 = max(0, y_indices.min() - pad)
y1 = min(h, y_indices.max() + pad)

cropped_rgb = final_rgb[y0:y1, x0:x1]
cropped_alpha = alpha_uint8[y0:y1, x0:x1]

# 6. Upscale 2x with Super-Resolution Sharpening (Lanczos + Unsharp Mask)
crop_h, crop_w = cropped_rgb.shape[:2]
target_w = crop_w * 2
target_h = crop_h * 2

pil_rgb = Image.fromarray(cropped_rgb)
pil_alpha = Image.fromarray(cropped_alpha)

upscaled_rgb = pil_rgb.resize((target_w, target_h), Image.Resampling.LANCZOS)
upscaled_alpha = pil_alpha.resize((target_w, target_h), Image.Resampling.LANCZOS)

# Texture Enhancement:
# 1. Unsharp Masking for crisp crystalline textures & thatch detail
sharpened_rgb = upscaled_rgb.filter(ImageFilter.UnsharpMask(radius=2.0, percent=145, threshold=1))

# 2. Contrast & Saturation Boost for rich editorial vibrancy
enhancer_contrast = ImageEnhance.Contrast(sharpened_rgb)
enhanced_rgb = enhancer_contrast.enhance(1.09)

enhancer_color = ImageEnhance.Color(enhanced_rgb)
enhanced_rgb = enhancer_color.enhance(1.15)

# 3. Assemble Full High-Res RGBA Island
final_island = Image.merge("RGBA", (*enhanced_rgb.split(), upscaled_alpha))
out_island_path = os.path.join(OUTPUT_DIR, "kutch_island_3d.png")
final_island.save(out_island_path, format="PNG", optimize=True)
print(f"[✓] Saved high-res 3D Island: {out_island_path} ({target_w}x{target_h})")

# Also copy to dist/assets so vite sees it immediately
dist_assets = "dist/assets"
if os.path.exists(dist_assets):
    final_island.save(os.path.join(dist_assets, "kutch_island_3d.png"), format="PNG")

# 7. Generate Ambient Occlusion Contact Shadow
shadow_w = target_w
shadow_h = int(target_h * 0.35)
shadow_arr = np.zeros((shadow_h, shadow_w, 4), dtype=np.uint8)

cy = shadow_h // 2
cx = shadow_w // 2
rx = int(shadow_w * 0.38)
ry = int(shadow_h * 0.28)

y_grid, x_grid = np.ogrid[:shadow_h, :shadow_w]
dist_ellipse = np.sqrt(((x_grid - cx) / rx) ** 2 + ((y_grid - cy) / ry) ** 2)
shadow_alpha = np.clip(1.0 - dist_ellipse, 0.0, 1.0)
shadow_alpha = np.cos((1.0 - shadow_alpha) * (np.pi / 2)) ** 2 * 0.32

shadow_arr[:, :, 0] = 15
shadow_arr[:, :, 1] = 20
shadow_arr[:, :, 2] = 28
shadow_arr[:, :, 3] = (shadow_alpha * 255.0).astype(np.uint8)

shadow_pil = Image.fromarray(shadow_arr, mode="RGBA").filter(ImageFilter.GaussianBlur(radius=18))
out_shadow_path = os.path.join(OUTPUT_DIR, "kutch_island_shadow.png")
shadow_pil.save(out_shadow_path, format="PNG", optimize=True)
if os.path.exists(dist_assets):
    shadow_pil.save(os.path.join(dist_assets, "kutch_island_shadow.png"), format="PNG")
print(f"[✓] Saved Contact Shadow: {out_shadow_path}")

# 8. Generate Glass Loupe Magnifier Crops (Just like in the reference image)
# Loupe 1: Bhunga Hut & Lippan Artisans
bhunga_cx = int(target_w * 0.48)
bhunga_cy = int(target_h * 0.28)
bhunga_radius = int(target_w * 0.14)
crop_bhunga = enhanced_rgb.crop((
    bhunga_cx - bhunga_radius,
    bhunga_cy - bhunga_radius,
    bhunga_cx + bhunga_radius,
    bhunga_cy + bhunga_radius
)).resize((440, 440), Image.Resampling.LANCZOS)
out_bhunga_path = os.path.join(OUTPUT_DIR, "kutch_loupe_bhunga.png")
crop_bhunga.save(out_bhunga_path, format="PNG")
if os.path.exists(dist_assets):
    crop_bhunga.save(os.path.join(dist_assets, "kutch_loupe_bhunga.png"), format="PNG")
print(f"[✓] Saved Bhunga Zoom Loupe: {out_bhunga_path}")

# Loupe 2: Crystalline White Salt Flats & Camels
salt_cx = int(target_w * 0.32)
salt_cy = int(target_h * 0.52)
salt_radius = int(target_w * 0.13)
crop_salt = enhanced_rgb.crop((
    salt_cx - salt_radius,
    salt_cy - salt_radius,
    salt_cx + salt_radius,
    salt_cy + salt_radius
)).resize((440, 440), Image.Resampling.LANCZOS)
out_salt_path = os.path.join(OUTPUT_DIR, "kutch_loupe_salt.png")
crop_salt.save(out_salt_path, format="PNG")
if os.path.exists(dist_assets):
    crop_salt.save(os.path.join(dist_assets, "kutch_loupe_salt.png"), format="PNG")
print(f"[✓] Saved Salt Zoom Loupe: {out_salt_path}")

# Loupe 3: Flamingo Lagoon Inlet
water_cx = int(target_w * 0.68)
water_cy = int(target_h * 0.52)
water_radius = int(target_w * 0.13)
crop_water = enhanced_rgb.crop((
    water_cx - water_radius,
    water_cy - water_radius,
    water_cx + water_radius,
    water_cy + water_radius
)).resize((440, 440), Image.Resampling.LANCZOS)
out_water_path = os.path.join(OUTPUT_DIR, "kutch_loupe_water.png")
crop_water.save(out_water_path, format="PNG")
if os.path.exists(dist_assets):
    crop_water.save(os.path.join(dist_assets, "kutch_loupe_water.png"), format="PNG")
print(f"[✓] Saved Lagoon Zoom Loupe: {out_water_path}")

print("\nRefined 3D Island layers and textures generated successfully!")
