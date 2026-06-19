from app.models.chit_model import Chit

def calculate_payout(db, chit_id, winning_bid):

    chit = db.query(Chit).filter(Chit.id == chit_id).first()

    total_pool = chit.total_members * chit.monthly_amount
    payout = total_pool - winning_bid

    return {
        "total_pool": total_pool,
        "winning_bid": winning_bid,
        "payout": payout
    }