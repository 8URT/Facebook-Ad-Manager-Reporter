import pandas as pd
import json
import os
import numpy as np

def csv_to_json(csv_filepath, json_filepath):
    """
    Converts a CSV file to a JSON file, explicitly replacing NaN values with None.
    Each row in the CSV becomes an object in a JSON array.
    """
    print(f"DEBUG: Starting conversion for CSV: {csv_filepath}")
    try:
        # Read the CSV file into a pandas DataFrame
        df = pd.read_csv(csv_filepath)
        print(f"DEBUG: DataFrame loaded. Shape: {df.shape}")
        print("DEBUG: Head of DataFrame before NaN replacement:")
        print(df.head()) # Shows first few rows, including NaNs if present

        # --- WORKAROUND: Replace NaN values across the DataFrame with None manually ---
        # This iterates through all columns and replaces NaN specifically.
        # This bypasses the problematic df.fillna() method.
        for column in df.columns:
            # np.nan is the standard representation for missing numerical data in numpy/pandas
            df[column] = df[column].replace({np.nan: None})
        print("DEBUG: NaN values replaced with None using column-wise replace().")
        print("DEBUG: Head of DataFrame AFTER NaN replacement:")
        print(df.head()) # Check again to see if NaNs are gone (should be 'None' or empty)

        # --- Specific Debugging Check for 'Post shares' column ---
        if 'Post shares' in df.columns:
            problem_row_index = 4 # Based on your previous JSON snippet
            if problem_row_index < len(df):
                print(f"DEBUG: Value in 'Post shares' for row {problem_row_index} AFTER replacement: {df.loc[problem_row_index, 'Post shares']}")
                print(f"DEBUG: Type of value: {type(df.loc[problem_row_index, 'Post shares'])}")
            else:
                print(f"DEBUG: Row {problem_row_index} out of bounds for 'Post shares' check.")
        else:
            print("DEBUG: 'Post shares' column not found in DataFrame.")
        # --- End Specific Debugging Check ---

        # Convert the DataFrame to a list of dictionaries (JSON format)
        json_data = df.to_dict(orient='records')
        print(f"DEBUG: Converted DataFrame to list of {len(json_data)} dictionaries.")

        # Write the JSON data to a file
        with open(json_filepath, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=4, ensure_ascii=False)
        print(f"DEBUG: JSON data written to '{json_filepath}'")
        print(f"Successfully converted '{csv_filepath}' to '{json_filepath}'")

    except FileNotFoundError:
        print(f"ERROR: The file '{csv_filepath}' was not found. Please check the path and filename.")
    except Exception as e:
        print(f"An error occurred: {e}")
        # Print full traceback for detailed error analysis
        import traceback
        traceback.print_exc()

# --- How to use the script ---
csv_directory = '/Users/burt/Documents/GitHub/Facebook-Ad-Manager-Reporter'
csv_filename = 'Le-Mauricien-LTD-Ad-sets-Jun-10-2025-Jul-9-2025.csv'
csv_file_full_path = os.path.join(csv_directory, csv_filename)

json_file = 'ads_data.json' # Desired output JSON file name

csv_to_json(csv_file_full_path, json_file)