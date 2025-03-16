import requests
import zipfile
import io

def download_xauusd_m1(year):
    """
    Downloads and extracts XAUUSD M1 historical data for a specified year from HistData.com.
    
    Args:
        year (int): The year for which to download the data (e.g., 2023).
    """
    # Construct the URL for XAUUSD M1 data for the given year
    url = f"http://www.histdata.com/download-free-forex-historical-data/?/ascii/1-minute-bar-quotes/xauusd/{year}"
    
    # Send a GET request to download the ZIP file
    response = requests.get(url, allow_redirects=True)  # Allow redirects to handle cases where the URL changes
    
    if response.status_code == 200:
        # Check if the content type is a zip file
        if 'zip' in response.headers.get('Content-Type', ''):
            try:
                # Open the ZIP file from the response content in memory
                with zipfile.ZipFile(io.BytesIO(response.content)) as zip_ref:
                    # Extract all contents to a directory named 'xauusd_m1_{year}'
                    zip_ref.extractall(f"xauusd_m1_{year}")
                print(f"Data for {year} downloaded and extracted to 'xauusd_m1_{year}' directory.")
            except zipfile.BadZipFile:
                print(f"Error: The downloaded file for {year} is not a valid zip file.")
            except Exception as e:
                print(f"An error occurred while extracting the zip file for {year}: {e}")
        else:
            print(f"Error: The server did not return a zip file for {year}. Content type: {response.headers.get('Content-Type')}")
            # Optionally, print the content of the response to see the HTML page
            # print(response.text)
    else:
        print(f"Failed to download data for {year}. Status code: {response.status_code}")

# Example usage: download data for 2023
download_xauusd_m1(2023)