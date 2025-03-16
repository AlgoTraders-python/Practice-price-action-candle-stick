from flask import Flask, jsonify, render_template, request
import pandas as pd
import logging
import traceback
import re  # Import the regular expression module

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load M5 candle data from CSV file
def load_candle_data(symbol):
    try:
        filename = f'data/{symbol}_M5.csv'
        df = pd.read_csv(filename)
        df['Time'] = pd.to_datetime(df['Time'], format="%d-%m-%Y %H:%M")
        logging.info(f"Candle data loaded successfully from {filename}.")
        return df
    except FileNotFoundError:
        logging.error(f"CSV file not found: {filename}")
        return None  # Or raise the exception if you want the app to stop
    except Exception as e:
        logging.error(f"Error loading candle data: {e}")
        return None


@app.route('/dual_chart')
def dual_chart():
    return render_template('dual_chart.html')

@app.route('/')
def index():
    try:
        return render_template('index.html')
    except Exception as e:
        logging.error(f"Error rendering index page: {e}\n{traceback.format_exc()}")
        return "<h1>Error rendering page</h1>", 500

@app.route('/api/candles', methods=['GET'])
def get_candles():
    start_date_str = request.args.get('startDate')
    end_date_str = request.args.get('endDate')
    interval = request.args.get('interval')
    symbol = request.args.get('symbol')  # Get symbol from request

    # Validate symbol
    if not symbol or not re.match(r'^[A-Za-z0-9]+$', symbol):
        return jsonify({"error": "Invalid symbol."}), 400

    # Validate interval
    allowed_intervals = ['M5', 'M15', 'H1', 'D1']
    if interval and interval not in allowed_intervals:
        return jsonify({"error": "Invalid interval. Allowed intervals: M5, M15, H1, D1"}), 400

    # Validate date format
    date_format = r'^\d{4}-\d{2}-\d{2}$'  # YYYY-MM-DD
    if start_date_str and not re.match(date_format, start_date_str):
        return jsonify({"error": "Invalid startDate format. Use YYYY-MM-DD."}), 400
    if end_date_str and not re.match(date_format, end_date_str):
        return jsonify({"error": "Invalid endDate format. Use YYYY-MM-DD."}), 400

    if not symbol:
        return jsonify({"error": "Symbol is required."}), 400

    df = load_candle_data(symbol)
    if df is None:
        return jsonify({"error": "Failed to load candle data for the given symbol."}), 500

    try:
        # Convert the date strings to datetime objects
        if start_date_str is None:
            start_date = df['Time'].min()  # Default to min date if not provided
        else:
            start_date = pd.to_datetime(start_date_str).replace(hour=0, minute=0, second=0)
        
        if end_date_str is None:
            end_date = df['Time'].max()  # Default to max date if not provided
        else:
            end_date = pd.to_datetime(end_date_str).replace(hour=23, minute=59, second=59)

        # Ensure 'Time' column in df is also in datetime format
        df['Time'] = pd.to_datetime(df['Time'])

        # Filter the DataFrame based on the date range
        df = df[(df['Time'] >= start_date) & (df['Time'] <= end_date)]

        # Define a mapping for interval to pandas frequency
        interval_map = {
            'M5': '5Min',
            'M15': '15Min',
            'H1': 'H',
            'D1': 'D'
        }

        # If interval is not provided, default to M5
        if not interval:
            interval = 'M5'

        # If interval is provided and valid, resample the data
        if interval and interval in interval_map:
            freq = interval_map[interval]
            
            # Set 'Time' as index for resampling
            df.set_index('Time', inplace=True)
            
            # Resample the data
            df = df.resample(freq).agg({
                'Open': 'first',
                'High': 'max',
                'Low': 'min',
                'Close': 'last'
            })
            
            # Reset index to make 'Time' a column again
            df.reset_index(inplace=True)
            
            # Drop any rows with missing values after resampling
            df.dropna(inplace=True)
        else:
            logging.warning("Invalid interval provided.")
            return jsonify({"error": "Invalid interval. Available intervals: M5, M15, H1, D1"}), 400

        logging.info(f"Start Date: {start_date}, End Date: {end_date}")
        logging.info(f"Number of records after filtering: {len(df)}")

    except ValueError as e:
        logging.error(f"Date parsing error: {e}")
        return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD."}), 400
    except Exception as e:
        logging.error(f"Error processing candle data: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "An unexpected error occurred."}), 500

    try:
        # Convert 'Time' column to Unix timestamps in seconds
        df['Time'] = (df['Time'].astype('int64') // 10**9).astype('int64')

        # Convert DataFrame to a list of dictionaries
        candle_data = df[['Time', 'Open', 'High', 'Low', 'Close']].to_dict(orient='records')

        # Lowercase the keys in candle_data
        candle_data = [{k.lower(): v for k, v in item.items()} for item in candle_data]

        return jsonify(candle_data)
    except Exception as e:
        logging.error(f"Error converting data to JSON: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "Error converting data to JSON."}), 500

@app.route('/api/date_range', methods=['GET'])
def get_date_range():
    symbol = request.args.get('symbol')  # Get symbol from request

    # Validate symbol
    if not symbol or not re.match(r'^[A-Za-z0-9]+$', symbol):
        return jsonify({"error": "Invalid symbol."}), 400
    df = load_candle_data(symbol)
    if df is None:
        return jsonify({"error": "Failed to load candle data."}), 500
    try:
        min_date = df['Time'].min().strftime('%Y-%m-%d')
        max_date = df['Time'].max().strftime('%Y-%m-%d')
        return jsonify({'min_date': min_date, 'max_date': max_date})
    except Exception as e:
        logging.error(f"Error getting date range: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "Error getting date range."}), 500



if __name__ == '__main__':
    app.run(debug=True)