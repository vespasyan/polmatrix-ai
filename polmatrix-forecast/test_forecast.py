import requests
import json

def test_forecast():
    url = "http://localhost:8000/forecast"
    payload = {
        "metric": "gdp",
        "region": "US", 
        "startYear": 2025,
        "endYear": 2027,  # Small range for testing
        "context": {"gdp": 23.0}  # Sample context
    }
    
    try:
        print("Testing forecast service...")
        print("URL:", url)
        print("Payload:", json.dumps(payload, indent=2))
        
        response = requests.post(url, json=payload)
        print("Status Code:", response.status_code)
        print("Response Headers:", dict(response.headers))
        
        if response.status_code == 200:
            print("Success! Response:", response.json())
        else:
            print("Error Response:", response.text)
            
    except Exception as e:
        print("Exception:", str(e))

if __name__ == "__main__":
    test_forecast()
