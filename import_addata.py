import requests
import json
import datetime

# --- Load configuration from a separate JSON file ---
try:
    with open('config.json', 'r') as config_file:
        config = json.load(config_file)
    
    # Assign loaded values to variables
    ACCESS_TOKEN = config['access_token']
    AD_ACCOUNT_ID = config['ad_account_id']
    CAMPAIGN_ID = config['campaign_id']
    
except FileNotFoundError:
    print("Error: config.json file not found. Please create one with your details.")
    exit()
except KeyError as e:
    print(f"Error: Missing key {e} in config.json. Please check your file.")
    exit()

# --- API Configuration ---
API_VERSION = 'v20.0'
BASE_URL = f"https://graph.facebook.com/{API_VERSION}"
INSIGHTS_ENDPOINT = f"{BASE_URL}/{CAMPAIGN_ID}/insights"

FIELDS = [
    "date_start",
    "impressions",
    "clicks",
    "reach",
    "ctr",
    "actions",
]

# --- Dynamic Date Calculation ---
today = datetime.date.today()
thirty_days_ago = today - datetime.timedelta(days=30)

# Parameters for the API request
PARAMS = {
    'access_token': ACCESS_TOKEN,
    'fields': ','.join(FIELDS),
    'level': 'campaign',
    'time_increment': 1,
    'time_range': json.dumps({
        # Use the dynamically calculated dates here
        'since': thirty_days_ago.strftime('%Y-%m-%d'),
        'until': today.strftime('%Y-%m-%d')
    })
}

# --- Make the API Request ---
def get_ad_insights():
    """
    Fetches ad insights data from the Facebook Graph API for a specific campaign.
    """
    print(f"Attempting to fetch data for Campaign: {CAMPAIGN_ID}...")
    try:
        response = requests.get(INSIGHTS_ENDPOINT, params=PARAMS)
        response.raise_for_status()
        
        data = response.json()
        
        file_path = f"facebook_ad_insights_{CAMPAIGN_ID}_{datetime.date.today()}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        print(f"Successfully fetched data and saved to {file_path}")
        
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        print(f"Response content: {response.text}")
    except Exception as err:
        print(f"An error occurred: {err}")

if __name__ == "__main__":
    get_ad_insights()