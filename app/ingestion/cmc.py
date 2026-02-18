import requests

CMC_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"
CMC_API_KEY = "1feb6d2a445b47a9b5c8310a99526f78"

def fetch_prices(symbols):
    headers = {
        "Accepts": "application/json",
        "X-CMC_PRO_API_KEY": CMC_API_KEY,
    }

    params = {
        "symbol": ",".join(symbols),
        "convert": "USD",
    }

    response = requests.get(CMC_URL, headers=headers, params=params)
    response.raise_for_status()

    data = response.json().get("data", {})

    prices = {}
    for symbol in symbols:
        try:
            price = data[symbol]["quote"]["USD"]["price"]
            prices[symbol] = price
        except KeyError:
            prices[symbol] = None  # symbol not found or missing price

    return prices
