import pandas as pd
import json

# Define the input CSV file path
csv_file_path = 'Le-Mauricien-LTD-Ad-sets-Jun-10-2025-Jul-9-2025.csv'
# Define the output JSON file path
output_json_file_path = 'gender_age_data.json'

try:
    # Load the CSV file
    df_gender_age = pd.read_csv(csv_file_path)

    # Group by 'Gender' and 'Age' and sum the relevant metrics
    gender_age_summary = df_gender_age.groupby(['Gender', 'Age']).agg(
        Total_Impressions=('Impressions', 'sum'),
        Total_Reach=('Reach', 'sum'),
        Total_Clicks=('Clicks (all)', 'sum')
    ).reset_index()

    # Define a custom order for Age groups for consistent sorting
    age_order = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
    gender_age_summary['Age'] = pd.Categorical(gender_age_summary['Age'], categories=age_order, ordered=True)

    # Sort by Gender (female, male, unknown) and then by Age for better readability
    gender_order = ['female', 'male', 'unknown']
    gender_age_summary['Gender'] = pd.Categorical(gender_age_summary['Gender'], categories=gender_order, ordered=True)
    gender_age_summary = gender_age_summary.sort_values(['Gender', 'Age'])

    # Convert the summary to a list of dictionaries (JSON format)
    gender_age_data = gender_age_summary.to_dict(orient='records')

    # Save the JSON data to a file
    with open(output_json_file_path, 'w') as f:
        json.dump(gender_age_data, f, indent=4)

    print(f"Successfully processed '{csv_file_path}' and saved the data to '{output_json_file_path}'")

except FileNotFoundError:
    print(f"Error: '{csv_file_path}' not found. Please ensure the CSV file is in the same directory as the script.")
except KeyError as e:
    print(f"Error: Missing expected column in CSV: {e}. Please check your CSV headers (e.g., 'Gender', 'Age', 'Impressions', 'Reach', 'Clicks (all)').")
except Exception as e:
    print(f"An unexpected error occurred during CSV processing: {e}")