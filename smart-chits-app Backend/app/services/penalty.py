# app/services/penalty.py

def calculate_penalty(amount, days_late):
    rate = 0.02
    return amount * rate * days_late