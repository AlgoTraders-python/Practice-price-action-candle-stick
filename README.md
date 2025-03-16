# Flask TradingView App

This project is a Flask application that serves M5 candle data for TradingView lightweight charts. The application reads candle data from a CSV file and provides it as a JSON API, which can be consumed by a front-end charting library.

## Project Structure

```
flask-tradingview-app
├── app.py                # Main entry point of the Flask application
├── data
│   └── m5_candles.csv    # CSV file containing M5 candle data
├── templates
│   └── index.html        # HTML template for the main page
├── static
│   ├── css
│   │   └── style.css     # CSS styles for the application
│   └── js
│       └── chart.js      # JavaScript for initializing the TradingView chart
├── requirements.txt      # List of dependencies for the application
└── README.md             # Documentation for the project
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd flask-tradingview-app
   ```

2. **Install dependencies:**
   It is recommended to use a virtual environment. You can create one using:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
   Then install the required packages:
   ```
   pip install -r requirements.txt
   ```

3. **Run the application:**
   Start the Flask application by running:
   ```
   python app.py
   ```
   The application will be available at `http://127.0.0.1:5000`.

## Usage

- Open your web browser and navigate to `http://127.0.0.1:5000` to view the TradingView chart.
- The chart will fetch M5 candle data from the Flask API and display it.

## License

This project is licensed under the MIT License.