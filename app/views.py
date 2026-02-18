from django.shortcuts import render
from app.ingestion.cmc import fetch_prices




def index(request):
    tokens = ["BTC", "ETH", "LINK", "DOT"]
    token_prices = fetch_prices(tokens)

    return render(request, "index.html", {
        "token_prices": token_prices
    })

def signup(request):
    return render(request, "login.html")