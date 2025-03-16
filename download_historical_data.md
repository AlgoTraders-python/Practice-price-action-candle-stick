# Downloading Historical Data for Bitcoin (BTCUSD) and Gold (XAUUSD)

This document explains how to download historical data for Bitcoin (BTCUSD) and Gold (XAUUSD) using the `dukascopy-node` command-line tool.  While the examples focus on these two instruments, the same principles apply to downloading data for *any* cryptocurrency or forex pair supported by Dukascopy.

## Prerequisites

*   **Node.js and npm:** You need to have Node.js and npm (Node Package Manager) installed on your system. You can download them from [https://nodejs.org/](https://nodejs.org/).
*   **dukascopy-node:** Install the `dukascopy-node` package globally using npm:

    ```bash
    npm install -g dukascopy-node
    ```

## Usage

The basic syntax for downloading historical data is:

   
Examples
Downloading Bitcoin (BTCUSD) Data
Download 5-minute (m5) data for BTCUSD from January 1, 2024, to January 31, 2024, in CSV format:

*   **Download 5-minute (m5)** data for BTCUSD from January 1, 2024, to January 31, 2024, in CSV format:

     ```bash
    npx dukascopy-node -i BTCUSD -from 2024-01-01 -to 2024-01-31 -t m5 -f csv
     ```

*   **Download 1-hour (H1)** data for BTCUSD from March 1, 2024, to March 15, 2024, in JSON format, including volumes, and save it to a directory named "btc_data":

     ```bash
    npx dukascopy-node -i BTCUSD -from 2024-03-01 -to 2024-03-15 -t H1 -f json -v -d btc_data
     ```

*   **Downloading Gold (XAUUSD)** Data

     ```bash
    npx dukascopy-node -i XAUUSD -from 2023-01-01 -to 2023-12-31 -t D1 -f csv
     ```

##  Important Notes
- Data Source: The data is sourced from Dukascopy Bank SA.
- Time Zone: The data is in GMT/UTC time zone.
- Rate Limiting: Be mindful of rate limiting. Avoid making too many requests in a short period.
- Data Accuracy: While Dukascopy is a reputable source, always verify the accuracy of the data before using it for critical applications.
- File Names: The downloaded files will be named based on the instrument, timeframe, and date range.
- npx: Using npx ensures you're using the most up-to-date version of dukascopy-node without requiring a global install (though a global install is recommended for convenience). If you have issues with npx, try running npm cache clean -f and then try the command again.
- Credits: This documentation is based on the dukascopy-node tool. For more information and the latest updates, please visit https://www.dukascopy-node.app/.
