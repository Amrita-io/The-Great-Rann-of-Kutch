#!/usr/bin/env python3
"""
scripts/build_seamless_rain_loop.py

Generates an imperceptibly seamless, continuous, studio-grade looping video for public/vid/rain_loop.mp4.
Eliminates audio pops and video stutter:
1. Temporal Swap & Optical Blend (xfade 1.0s, acrossfade 1.0s).
2. Extended 30+ second stream so browser loops rarely.
3. FastStart web optimization (-movflags +faststart) for instant zero-latency loop.
"""

import os
import subprocess
import json

SOURCE_INPUT = "vid/rain loop.mp4"
TARGET_OUTPUT = "public/vid/rain_loop.mp4"
TEMP_UNIT = "public/vid/temp_rain_unit.mp4"
TEMP_MASTER = "public/vid/temp_rain_master.mp4"

def get_duration(path):
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return float(res.stdout.strip())

def main():
    if not os.path.exists(SOURCE_INPUT):
        # check public/vid/rain loop.mp4
        if os.path.exists("public/vid/rain loop.mp4"):
            src = "public/vid/rain loop.mp4"
        else:
            raise FileNotFoundError(f"Source file not found: {SOURCE_INPUT}")
    else:
        src = SOURCE_INPUT

    total_dur = get_duration(src)
    print(f"Source: {src}, Duration: {total_dur:.3f}s")

    xfade_dur = 1.0
    split_pt = total_dur - xfade_dur # e.g. 11.598 - 1.0 = 10.598
    unit_dur = total_dur - xfade_dur # 10.598s

    print(f"Creating seamless atomic unit with {xfade_dur}s optical crossfade and equal-power audio blend...")

    # Filter:
    # v1 is 0 to split_pt (0 to 10.598)
    # v2 is split_pt to total_dur (10.598 to 11.598) - 1.0s long
    # We swap order: v2 plays first, then xfade into v1.
    # offset for xfade is duration of v2 minus xfade_dur = 1.0 - 1.0 = 0.0?
    # Better:
    # Let vA be start: 0 to 1.5s
    # Let vB be end: 1.5s to total_dur
    # xfade vB into vA at offset = (total_dur - 1.5) - xfade_dur
    # Then the end of vA flows naturally into vB (which was originally adjacent!)
    
    cross_offset = total_dur - 1.5 - xfade_dur # e.g. 11.598 - 1.5 - 1.0 = 9.098
    
    cmd_unit = [
        "ffmpeg", "-y",
        "-i", src,
        "-filter_complex",
        f"[0:v]split[vA][vB];"
        f"[vA]trim=start=0:end=1.5,setpts=PTS-STARTPTS[vA_pts];"
        f"[vB]trim=start=1.5:end={total_dur},setpts=PTS-STARTPTS[vB_pts];"
        f"[0:a]aresample=48000,asplit[aA][aB];"
        f"[aA]atrim=start=0:end=1.5,asetpts=PTS-STARTPTS[aA_pts];"
        f"[aB]atrim=start=1.5:end={total_dur},asetpts=PTS-STARTPTS[aB_pts];"
        f"[vB_pts][vA_pts]xfade=transition=fade:duration={xfade_dur}:offset={cross_offset:.3f},fps=30[vout];"
        f"[aB_pts][aA_pts]acrossfade=d={xfade_dur}:c1=tri:c2=tri,atrim=start=0:end={total_dur - xfade_dur:.3f},asetpts=PTS-STARTPTS[aout]",
        "-map", "[vout]", "-map", "[aout]",
        "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-t", f"{total_dur - xfade_dur:.3f}",
        TEMP_UNIT
    ]
    subprocess.run(cmd_unit, check=True)
    print("Atomic unit created successfully.")

    unit_actual_dur = get_duration(TEMP_UNIT)
    print(f"Atomic unit actual duration: {unit_actual_dur:.3f}s")

    # Step 2: Loop 3 times to create a 31+ second seamless file
    print("Looping 3 times for extended seamless web playback...")
    cmd_master = [
        "ffmpeg", "-y",
        "-stream_loop", "2",
        "-i", TEMP_UNIT,
        "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-movflags", "+faststart",
        TEMP_MASTER
    ]
    subprocess.run(cmd_master, check=True)

    # Step 3: Overwrite targets
    if os.path.exists(TARGET_OUTPUT):
        os.remove(TARGET_OUTPUT)
    os.rename(TEMP_MASTER, TARGET_OUTPUT)

    # Also update space-separated version
    import shutil
    shutil.copyfile(TARGET_OUTPUT, "public/vid/rain loop.mp4")

    # Clean temp
    if os.path.exists(TEMP_UNIT):
        os.remove(TEMP_UNIT)

    master_dur = get_duration(TARGET_OUTPUT)
    print(f"Successfully deployed seamless {master_dur:.2f}s loop to {TARGET_OUTPUT} and public/vid/rain loop.mp4!")

if __name__ == "__main__":
    main()

