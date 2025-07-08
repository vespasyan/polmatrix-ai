#!/usr/bin/env python3

# Test script for EDGAR integration

import sys

print("Testing EDGAR integration...")

# Test pandas import
try:
    import pandas as pd
    print("✓ pandas imported successfully")
except ImportError as e:
    print(f"✗ pandas import failed: {e}")
    sys.exit(1)

# Test zipfile import
try:
    import zipfile
    print("✓ zipfile imported successfully")
except ImportError as e:
    print(f"✗ zipfile import failed: {e}")
    sys.exit(1)

# Test io import
try:
    import io
    print("✓ io imported successfully")
except ImportError as e:
    print(f"✗ io import failed: {e}")
    sys.exit(1)

# Test requests import
try:
    import requests
    print("✓ requests imported successfully")
except ImportError as e:
    print(f"✗ requests import failed: {e}")
    sys.exit(1)

print("\nAll imports successful! EDGAR integration should work.")

# Test basic EDGAR URL construction
EDGAR_BASE = "https://jeodpp.jrc.ec.europa.eu/ftp/jrc-opendata/EDGAR/datasets/v80_FT2022_GHG"
test_file = "IEA_EDGAR_CO2_1970_2022.zip"
test_url = f"{EDGAR_BASE}/{test_file}"

print(f"\nTest EDGAR URL: {test_url}")

# Test if we can make a HEAD request to check if the file exists
try:
    resp = requests.head(test_url, timeout=10)
    print(f"EDGAR file availability test: HTTP {resp.status_code}")
    if resp.status_code == 200:
        print("✓ EDGAR files should be accessible")
    else:
        print("⚠ EDGAR files might not be accessible")
except Exception as e:
    print(f"⚠ Could not test EDGAR file accessibility: {e}")

print("\nEDGAR integration test completed.")
