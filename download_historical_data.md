

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

    npx dukascopy-node -i BTCUSD -from 2024-01-01 -to 2024-01-31 -t m5 -f csv

*   **Download 1-hour (H1)** data for BTCUSD from March 1, 2024, to March 15, 2024, in JSON format, including volumes, and save it to a directory named "btc_data":

    npx dukascopy-node -i BTCUSD -from 2024-03-01 -to 2024-03-15 -t H1 -f json -v -d btc_data

*   **Downloading Gold (XAUUSD)** Data

    npx dukascopy-node -i xauusd -from 2020-01-13 -to 2025-02-25 -t m5 -f csv
