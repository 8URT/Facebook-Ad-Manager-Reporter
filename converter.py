import pandas as pd
import json
import os

def csv_to_json(csv_filepath, json_filepath):
    """
    Converts a CSV file to a JSON file.
    Each row in the CSV becomes an object in a JSON array.
    """
    try:
        # Read the CSV file into a pandas DataFrame
        df = pd.read_csv(csv_filepath)

        # Convert the DataFrame to a list of dictionaries (JSON format)
        json_data = df.to_dict(orient='records')

        # Write the JSON data to a file
        with open(json_filepath, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=4, ensure_ascii=False)

        print(f"Successfully converted '{csv_filepath}' to '{json_filepath}'")
    except FileNotFoundError:
        print(f"Error: The file '{csv_filepath}' was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

# --- How to use the script ---
# 1. Save the above code as a Python file (e.g., convert_script.py)
# 2. Make sure your CSV file is in the specified path.

# Example Usage with your provided path:
# Construct the full path to the CSV file
csv_directory = '/Users/burt/Documents/GitHub/Facebook-Ad-Manager-Reporter'
csv_filename = 'Le-Mauricien-LTD-Ad-sets-Jun-10-2025-Jul-9-2025.csv'
csv_file_full_path = os.path.join(csv_directory, csv_filename)

json_file = 'ads_data.json' # Desired output JSON file name (will be created in the current working directory where you run the script)

csv_to_json(csv_file_full_path, json_file)