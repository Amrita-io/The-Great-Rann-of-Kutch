import h5py
import glob
import os
import math
import json
import numpy as np

# Coordinates
PINS = {
    "allah_bund": {"name": "1819 Allah Bund Scarp", "lat": 24.25, "lon": 69.80},
    "core_basin": {"name": "Core Fossil Basin", "lat": 24.05, "lon": 70.10},
    "khadir_island": {"name": "Khadir Island / Flamingo City", "lat": 24.10, "lon": 70.40},
    "kori_creek": {"name": "Kori Creek Tidal Ingress", "lat": 23.85, "lon": 69.65},
    "banni_grassland": {"name": "Banni Savanna Commons", "lat": 23.65, "lon": 69.50}
}

def latlon_to_utm(lat, lon, zone=42):
    a = 6378137.0
    f = 1 / 298.257223563
    e2 = 2 * f - f * f
    e_prime2 = e2 / (1 - e2)
    lat_rad = math.radians(lat)
    lon_rad = math.radians(lon)
    lon0_rad = math.radians((zone - 1) * 6 - 180 + 3)
    N = a / math.sqrt(1 - e2 * math.sin(lat_rad)**2)
    T = math.tan(lat_rad)**2
    C = e_prime2 * math.cos(lat_rad)**2
    A = math.cos(lat_rad) * (lon_rad - lon0_rad)
    M = a * ((1 - e2/4 - 3*e2**2/64 - 5*e2**3/256) * lat_rad
             - (3*e2/8 + 3*e2**2/32 + 45*e2**3/1024) * math.sin(2*lat_rad)
             + (15*e2**2/256 + 45*e2**3/1024) * math.sin(4*lat_rad)
             - (35*e2**3/3072) * math.sin(6*lat_rad))
    k0 = 0.9996
    x = k0 * N * (A + (1 - T + C) * A**3 / 6 + (5 - 18*T + T**2 + 72*C - 58*e_prime2) * A**5 / 120) + 500000.0
    y = k0 * (M + N * math.tan(lat_rad) * (A**2 / 2 + (5 - T + 9*C + 4*C**2) * A**4 / 24 + (61 - 58*T + T**2 + 600*C - 330*e_prime2) * A**6 / 720))
    return x, y

# Precalculate UTM coordinates for all pins
for k, p in PINS.items():
    p["x"], p["y"] = latlon_to_utm(p["lat"], p["lon"])

# Kutch Basin 160km bounding box
X_MIN, X_MAX = 540000.0, 700000.0
Y_MIN, Y_MAX = 2640000.0, 2800000.0
WATER_THRESHOLD_DB = -20.0
WATER_THRESHOLD_LIN = 10.0 ** (WATER_THRESHOLD_DB / 10.0)

# Granules to process - representative one per 12-day cycle
CYCLE_FILES = [
    ("Cycle 025 (Jul 12)", "NISAR Data/NISAR_L2_PR_GCOV_025_063_D_076_2005_DHDH_M_20260712T135737_20260712T135812_P05023_N_F_J_001.h5"),
    ("Cycle 026 (Jul 24)", "NISAR Data/NISAR_L2_PR_GCOV_026_063_D_076_4005_DHDH_A_20260724T135736_20260724T135811_P05023_N_F_J_001.h5"),
    ("Cycle 028 (Aug 17)", "NISAR Data/NISAR_L2_PR_GCOV_028_063_D_076_4005_DHDH_A_20260817T135735_20260817T135810_P05023_N_F_J_001.h5"),
    ("Cycle 029 (Aug 29)", "NISAR Data/NISAR_L2_PR_GCOV_029_063_D_076_2005_QPDH_A_20260829T135735_20260829T135809_P05023_N_F_J_001.h5"),
    ("Cycle 030 (Sep 10)", "NISAR Data/NISAR_L2_PR_GCOV_030_063_D_076_2005_DHDH_M_20260910T135735_20260910T135809_P05023_N_F_J_001.h5"),
    ("Cycle 031 (Sep 22)", "NISAR Data/NISAR_L2_PR_GCOV_031_063_D_076_2005_QPDH_A_20260922T135735_20260922T135809_P05023_N_F_J_001.h5"),
    ("Cycle 032 (Oct 04)", "NISAR Data/NISAR_L2_PR_GCOV_032_063_D_076_2005_DHDH_M_20261004T135735_20261004T135809_P05023_N_F_J_001.h5"),
    ("Cycle 033 (Oct 16)", "NISAR Data/NISAR_L2_PR_GCOV_033_063_D_076_2005_DHDH_M_20261016T135735_20261016T135809_P05023_N_F_J_001.h5"),
    ("Cycle 034 (Oct 28)", "NISAR Data/NISAR_L2_PR_GCOV_034_063_D_076_4005_DHDH_A_20261028T135735_20261028T135810_P05036_N_F_J_001.h5")
]

results = {
    "metadata": {
        "sensor": "NASA-ISRO NISAR LSAR (24 cm L-Band, 1.25 GHz)",
        "track": 63,
        "frame": 76,
        "repeat_cycle_days": 12,
        "pixel_spacing_m": 20.0,
        "pixel_area_km2": 0.0004,
        "water_threshold_db": WATER_THRESHOLD_DB,
        "nesz_noise_floor_db": -23.0,
        "study_basin": {
            "name": "Great Rann of Kutch Basin Window",
            "utm_zone": "42N",
            "x_range_m": [X_MIN, X_MAX],
            "y_range_m": [Y_MIN, Y_MAX],
            "total_box_area_km2": ((X_MAX - X_MIN) / 1000.0) * ((Y_MAX - Y_MIN) / 1000.0)
        }
    },
    "passes": {},
    "pins": {}
}

# Initialize pins summary
for k, p in PINS.items():
    results["pins"][k] = {
        "name": p["name"],
        "lat": p["lat"],
        "lon": p["lon"],
        "utm_x": round(p["x"], 1),
        "utm_y": round(p["y"], 1),
        "time_series": {}
    }

print("Computing measured data from real NISAR L2 GCOV granules...")

for label, fpath in CYCLE_FILES:
    if not os.path.exists(fpath):
        print(f"Skipping missing file: {fpath}")
        continue
    
    print(f"\nProcessing {label}: {os.path.basename(fpath)}")
    with h5py.File(fpath, "r") as h:
        ident = h["science/LSAR/identification"]
        gid = ident["granuleId"][()].decode() if hasattr(ident["granuleId"][()], "decode") else str(ident["granuleId"][()])
        dt = ident["processingDateTime"][()].decode() if hasattr(ident["processingDateTime"][()], "decode") else str(ident["processingDateTime"][()])
        
        # Grid
        grid = h["science/LSAR/GCOV/grids/frequencyA"]
        dx = float(grid["xCoordinateSpacing"][()])
        dy = float(grid["yCoordinateSpacing"][()])
        x_coords = grid["xCoordinates"]
        y_coords = grid["yCoordinates"]
        
        x0 = float(x_coords[0])
        y0 = float(y_coords[0])
        
        # Bounding indices for basin
        col_min = max(0, int((X_MIN - x0) / dx))
        col_max = min(len(x_coords), int((X_MAX - x0) / dx))
        # Note dy is negative: y decreases with row index
        row_min = max(0, int((Y_MAX - y0) / dy))
        row_max = min(len(y_coords), int((Y_MIN - y0) / dy))
        if row_min > row_max:
            row_min, row_max = row_max, row_min
        
        hh_ds = grid["HHHH"]
        has_hv = "HVHV" in grid
        hv_ds = grid["HVHV"] if has_hv else None
        mask_ds = grid["mask"] if "mask" in grid else None
        
        # 1. Sample 5x5 window around each pin
        for pk, pv in PINS.items():
            px, py = pv["x"], pv["y"]
            col = int((px - x0) / dx)
            row = int((py - y0) / dy)
            
            if 2 <= row < hh_ds.shape[0] - 2 and 2 <= col < hh_ds.shape[1] - 2:
                hh_win = hh_ds[row-2:row+3, col-2:col+3]
                hh_valid = hh_win[np.isfinite(hh_win) & (hh_win > 0)]
                mean_hh_lin = float(np.mean(hh_valid)) if len(hh_valid) > 0 else float("nan")
                mean_hh_db = round(10.0 * math.log10(mean_hh_lin), 2) if not math.isnan(mean_hh_lin) and mean_hh_lin > 0 else None
                
                mean_hv_db = None
                near_noise_floor = False
                if hv_ds is not None:
                    hv_win = hv_ds[row-2:row+3, col-2:col+3]
                    hv_valid = hv_win[np.isfinite(hv_win) & (hv_win > 0)]
                    mean_hv_lin = float(np.mean(hv_valid)) if len(hv_valid) > 0 else float("nan")
                    if not math.isnan(mean_hv_lin) and mean_hv_lin > 0:
                        mean_hv_db = round(10.0 * math.log10(mean_hv_lin), 2)
                        if mean_hv_db < -23.0:
                            near_noise_floor = True
                
                pin_record = {
                    "pixel_coords": [row, col],
                    "mean_hh_db": mean_hh_db,
                    "mean_hv_db": mean_hv_db,
                    "near_noise_floor": near_noise_floor
                }
                results["pins"][pk]["time_series"][label] = pin_record
                print(f"  {pv['name']}: HH={mean_hh_db} dB, HV={mean_hv_db} dB, NearNoise={near_noise_floor}")
        
        # 2. Compute dark water area in chunks over the basin
        print(f"  Computing basin dark water (rows {row_min}:{row_max}, cols {col_min}:{col_max})...")
        total_pixels = 0
        valid_pixels = 0
        water_pixels = 0
        chunk_size = 500
        
        for r_start in range(row_min, row_max, chunk_size):
            r_end = min(row_max, r_start + chunk_size)
            hh_chunk = hh_ds[r_start:r_end, col_min:col_max]
            
            valid_mask = np.isfinite(hh_chunk) & (hh_chunk > 0)
            if mask_ds is not None:
                m_chunk = mask_ds[r_start:r_end, col_min:col_max]
                valid_mask &= (m_chunk != 0)
            
            total_pixels += hh_chunk.size
            valid_pixels += int(np.sum(valid_mask))
            water_pixels += int(np.sum(valid_mask & (hh_chunk <= WATER_THRESHOLD_LIN)))
        
        dark_water_km2 = round(water_pixels * 0.0004, 1)
        valid_fraction = round(valid_pixels / total_pixels, 4) if total_pixels > 0 else 0.0
        gap_fill_fraction = round(1.0 - valid_fraction, 4)
        
        print(f"  -> Dark water area: {dark_water_km2} km² (Valid data: {valid_fraction*100:.1f}%, Gap: {gap_fill_fraction*100:.1f}%)")
        
        results["passes"][label] = {
            "granule_id": gid,
            "processed_date": dt,
            "dark_water_km2": dark_water_km2,
            "valid_data_fraction": valid_fraction,
            "gap_fraction": gap_fill_fraction,
            "water_threshold_db": WATER_THRESHOLD_DB
        }

os.makedirs("src/data", exist_ok=True)
with open("src/data/measured.json", "w") as out:
    json.dump(results, out, indent=2)

print("\nSuccessfully generated src/data/measured.json!")
