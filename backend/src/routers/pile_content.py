
from src.db import Card, Pile, PileContent, Deck, User, get_async_session
from src.schemas import CreatePileRequest, PileContentResponse, PileResponse
from src.users import  current_active_user
from fastapi import  Depends, APIRouter, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, insert
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
import uuid
import random
router = APIRouter(prefix="/piles", tags=["piles"])


@router.get("/list")
async def get_piles(
    user : User = Depends(current_active_user),
    db: AsyncSession= Depends(get_async_session)
):
    result = await db.execute(select(Pile)
                              .where(Pile.is_deleted == False)
                              .where(Pile.user_id == user.id)
                              .options(selectinload(Pile.pile_contents))
                              .order_by(Pile.drawn_at.desc()))
    piles = [row[0] for row in result.all()]
    return {"piles": piles}

@router.post("/add")
async def add_new_pile(
    request: CreatePileRequest,
    user: User =Depends(current_active_user),
    db: AsyncSession= Depends(get_async_session)
):
    # 1. Validate number of cards
    if request.number_of_cards < 1 or request.number_of_cards> 12:
        raise HTTPException(
            status_code= 400,
            detail="number of cards you requested should be between 1 to 70"
        )
     # 2. Get the Tarot deck and its cards
    result = await db.execute(select(Deck).where(Deck.deck_type =="Tarot", Deck.is_deleted ==False))
    deck = result.scalar_one_or_none()
    if not deck:
        raise HTTPException(
            status_code= 404,
            detail="Tarot deck not found in the database"
        )
    stmt = select(Card).where(
        Card.deck_id == deck.deck_id,
        Card.is_deleted == False
    ).order_by(Card.card_position)  # position is the original order in the deck
    result = await db.execute(stmt)
    all_cards = result.scalars().all()
    if len(all_cards) < request.number_of_cards:
        raise HTTPException(
            status_code=400,
            detail=f"Only {len(all_cards)} cards available in the deck, but requested {request.number_of_cards}"
        )
    
    # 3. Shuffle and draw without replacement
    shuffled_cards = all_cards.copy()
    random.shuffle(shuffled_cards)
    drawn_cards = shuffled_cards[:request.number_of_cards]
    
    # 4. Create the Pile
    new_pile = Pile(
        user_id=user.id,
        drawn_at=datetime.now(timezone.utc)
    )
    db.add(new_pile)
    await db.flush()  # to get new_pile.pile_id
    
    # 5. Create PileContent entries
    pile_contents = []
    for position, card in enumerate(drawn_cards):
        # 50% chance of reversed card
        if request.is_reversed:
            is_reversed = random.choice([True, False])
        else:
            is_reversed = False
        pile_content = PileContent(
            pile_id=new_pile.pile_id,
            card_id=card.card_id,
            reversed_card=is_reversed,
            position=position  # 0-indexed draw order
        )
        pile_contents.append(pile_content)
        db.add(pile_content)
    
    await db.commit()
    await db.refresh(new_pile)
    # 6. Build response with card details
    response_cards = []
    for pc in pile_contents:
        # fetch card details (already in memory, but we can use the card object)
        card = next(c for c in drawn_cards if c.card_id == pc.card_id)
        response_cards.append(PileContentResponse(
            pile_content_id=pc.pile_content_id,
            card_id=card.card_id,
            card_name=card.card_name,
            card_suit=card.card_suit,
            card_metadata=card.card_metadata,
            image_url=card.image_url,
            reversed_card=pc.reversed_card,
            position=pc.position
        ))
    
    return PileResponse(
        pile_id=new_pile.pile_id,
        user_id=new_pile.user_id,
        drawn_at=new_pile.drawn_at,
        cards=response_cards
    )