
from src.db import Card, Pile, PileContent, Deck, User, get_async_session
from src.schemas import CreatePileRequest
from src.users import  current_active_user
from fastapi import  Depends, APIRouter, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
import random
router = APIRouter(prefix="/piles", tags=["piles"])


@router.get("/list")
async def get_piles(
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    try:
        result = await db.execute(
            select(Pile)
            .where(Pile.is_deleted == False)
            .where(Pile.user_id == user.id)
            .options(selectinload(Pile.pile_contents))
            .order_by(Pile.drawn_at.desc())
        )
        # result.scalars() is cleaner than row[0] for row in result.all()
        piles = result.scalars().all()

        return {
            "success": True,
            "data": piles,
            "message": "Piles retrieved successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "data": [],
            "message": "Failed to retrieve piles"
        }

@router.post("/add")
async def add_new_pile(
    request: CreatePileRequest,
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    # 1. Validation Logic
    if request.number_of_cards < 1 or request.number_of_cards > 78:
        return {
            "success": False,
            "data": None,
            "message": "Number of cards must be between 1 and 78"
        }

    try:
        # 2. Get the Tarot deck
        result = await db.execute(select(Deck).where(Deck.deck_type == "Tarot", Deck.is_deleted == False))
        deck = result.scalar_one_or_none()
        
        if not deck:
            return { "success": False, "data": None, "message": "Tarot deck not found" }

        # 3. Get all available cards
        card_stmt = select(Card).where(Card.deck_id == deck.deck_id, Card.is_deleted == False)
        card_result = await db.execute(card_stmt)
        all_cards = card_result.scalars().all()

        if len(all_cards) < request.number_of_cards:
            return {
                "success": False,
                "data": None,
                "message": f"Only {len(all_cards)} cards available"
            }

        # 4. Shuffle and draw
        shuffled_cards = list(all_cards)
        random.shuffle(shuffled_cards)
        drawn_cards = shuffled_cards[:request.number_of_cards]

        # 5. Create the Pile record
        new_pile = Pile(user_id=user.id, drawn_at=datetime.now(timezone.utc))
        db.add(new_pile)
        await db.flush()

        # 6. Create PileContent entries
        response_cards = []
        for position, card in enumerate(drawn_cards):
            is_reversed = random.choice([True, False]) if request.is_reversed else False
            
            pc = PileContent(
                pile_id=new_pile.pile_id,
                card_id=card.card_id,
                reversed_card=is_reversed,
                position=position
            )
            db.add(pc)
            
            # Build response item immediately to avoid extra loops
            response_cards.append({
                "card_id": card.card_id,
                "card_name": card.card_name,
                "card_suit": card.card_suit,
                "image_url": card.image_url,
                "reversed_card": is_reversed,
                "position": position,
                "card_metadata": card.card_metadata
            })

        await db.commit()

        # Final Envelope Response
        return {
            "success": True,
            "data": {
                "pile_id": new_pile.pile_id,
                "drawn_at": new_pile.drawn_at,
                "cards": response_cards
            },
            "message": f"Successfully drew {request.number_of_cards} cards"
        }

    except Exception as e:
        await db.rollback()
        print(f"Draw Error: {e}")
        return {
            "success": False,
            "data": None,
            "message": "An error occurred while drawing cards"
        }