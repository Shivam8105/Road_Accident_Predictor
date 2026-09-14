import pandas as pd
import numpy as np
import json
import os

def inspect_dataset(file_path, name):
    print(f"\n==================================================")
    print(f"       INSPECTING DATASET: {name} ({file_path})")
    print(f"==================================================")
    
    if not os.path.exists(file_path):
        print(f"ERROR: File {file_path} does not exist.")
        return None

    df = pd.read_csv(file_path)
    rows, cols = df.shape
    print(f"Number of Rows: {rows}")
    print(f"Number of Columns: {cols}")
    
    print("\n--- COLUMN NAMES & DATA TYPES ---")
    dtypes_dict = df.dtypes.to_dict()
    for col, dtype in dtypes_dict.items():
        print(f"  • {col}: {dtype}")
        
    print("\n--- MISSING VALUES ---")
    missing = df.isnull().sum()
    missing_cols = missing[missing > 0]
    if len(missing_cols) == 0:
        print("  None (0 missing values across all columns)")
    else:
        for col, count in missing_cols.items():
            pct = (count / rows) * 100
            print(f"  • {col}: {count} missing ({pct:.2f}%)")
            
    print(f"\n--- DUPLICATE ROWS ---")
    dups = df.duplicated().sum()
    print(f"  Total duplicate rows: {dups}")

    print("\n--- NUMERICAL VS CATEGORICAL COLUMNS ---")
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    print(f"  Numerical ({len(num_cols)}): {num_cols}")
    print(f"  Categorical ({len(cat_cols)}): {cat_cols}")
    
    print("\n--- UNIQUE VALUES & SAMPLE DATA ---")
    for col in df.columns:
        n_unique = df[col].nunique()
        sample_vals = df[col].dropna().unique()[:3]
        print(f"  • {col} ({n_unique} unique): {sample_vals}")

    print("\n--- TARGET CANDIDATES & DISTRIBUTION ---")
    target_cols = [c for c in df.columns if 'severity' in c.lower()]
    for tcol in target_cols:
        print(f"  Distribution for candidate target '{tcol}':")
        vc = df[tcol].value_counts(dropna=False)
        for val, cnt in vc.items():
            pct = (cnt / rows) * 100
            print(f"    - {val}: {cnt} ({pct:.2f}%)")
            
    return {
        "name": name,
        "rows": rows,
        "cols": cols,
        "num_cols": num_cols,
        "cat_cols": cat_cols,
        "missing": missing_cols.to_dict(),
        "duplicates": int(dups)
    }

if __name__ == "__main__":
    d1_summary = inspect_dataset("indian_roads_dataset.csv", "Dataset 1: Indian Roads")
    d2_summary = inspect_dataset("Road.csv", "Dataset 2: Detailed Accident Factors")
