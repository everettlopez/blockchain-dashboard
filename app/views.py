from django.shortcuts import render

from app.ingestion.cmc import fetch_prices
from app.ingestion.alchemy import fetch_tokens_by_wallet
from app.forms import LoginForm, SignupForm
from django.contrib.auth.models import User
from app.models import UserProfile

from django.shortcuts import render, redirect 
from django.contrib.auth import authenticate, login 
from django.contrib.auth.decorators import login_required


def index(request):
    tokens = ["BTC", "ETH", "LINK", "DOT"]
    token_prices = fetch_prices(tokens)

    

    return render(request, "index.html", {
        "token_prices": token_prices
    })

def signup(request):
    form = SignupForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        username = form.cleaned_data["username"]
        password = form.cleaned_data["password"]
        wallet = form.cleaned_data["wallet_address"]

        if User.objects.filter(username=username).exists(): 
            form.add_error("username", "This username is already taken.") 
            return render(request, "signup.html", {"form": form})

        user = User.objects.create_user(username=username, password=password)
        UserProfile.objects.create(user=user, wallet_address=wallet)

        user = authenticate(request, username=username, password=password)
        login(request, user)

        return redirect("dashboard")

    return render(request, "signup.html", {
        "form": form
    })

def login_view(request):
    form = LoginForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        username = form.cleaned_data["username"]
        password = form.cleaned_data["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            print("logged in")
            return redirect("dashboard")
        else:
            print(" not logged in")
            form.add_error(None, "Invalid")

        print("nothin")

    print("FORM VALID:", form.is_valid()) 
    print("ERRORS:", form.errors)
    
    return render(request, "login.html", {"form": form})

@login_required
def dashboard(request):

    wallet_address = request.user.userprofile.wallet_address

    data = fetch_tokens_by_wallet(wallet_address)

    addresses = data.get("addresses", []) 
    takens_by_wallet = data.get("tokens", [])

    token_map = {}

    for t in takens_by_wallet:
        meta = t.get("tokenMetadata", {})
        symbol = meta.get("symbol")


        if symbol:
            token_map[symbol] = t 

    return render(request, "dashboard.html", {
        "takens_by_wallet": token_map,
        "wallet_address": wallet_address
    })