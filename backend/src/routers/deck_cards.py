import shutil
import os
import uuid
import tempfile
import io
import csv
from src.db import Card, Deck
from src.db import get_async_session, User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from src.images import imagekit
from fastapi import  File, UploadFile, Form, Depends, APIRouter, HTTPException
from src.schemas import CardCSVRow, DeckCreate, CardUpdate, CardImageUpdate
from src.users import  current_active_user


router = APIRouter()

@router.get("/list")
async def get_decks(db: AsyncSession= Depends(get_async_session)):
    result = await db.execute(select(Deck).order_by(Deck.created_at.desc()))
    decks = [row[0] for row in result.all()]
    return {"decks": decks}

@router.post("/add")
async def add_new_deck(
    deck_in:  DeckCreate,
    user: User =Depends(current_active_user),
    db: AsyncSession= Depends(get_async_session)
):
    new_deck = Deck(
        deck_name = deck_in.deck_name,
        deck_type = deck_in.deck_type
    )
    db.add(new_deck)
    await db.commit()
    await db.refresh(new_deck)
    return {"status":"success", "deck": new_deck}


# Cards endpoints
@router.get("/{deck_id}/cards")
async def get_cards( deck_id:uuid.UUID,db: AsyncSession= Depends(get_async_session)):
    result = await db.execute(select(Card).where(Card.deck_id == deck_id).order_by(Card.card_suit.desc()))
    cards = [row[0] for row in result.all()]
    return {"cards": cards}


@router.post("/{deck_id}/cards/upload")
async def upload_cards_from_csv(
    deck_id:uuid.UUID,
    file:UploadFile =File(...),
    user: User =Depends(current_active_user), 
    db: AsyncSession = Depends(get_async_session)
):
    content = await file.read()
    stream = io.StringIO(content.decode("utf-8"))
    reader = csv.DictReader(stream)

    new_cards =[]
    errors =[]

    for index, row in enumerate(reader, start=2):
        try:
            card_data = CardCSVRow(
                name_and_number= row["Card Number & Name"],
                suit=row["suit"],
                image_url=row["image_url"] if row["image_url"] else None,
                metadata= row["metadata"]
            )

            new_card = Card(
                deck_id= deck_id,
                card_name = card_data.name_and_number,
                card_suit = card_data.suit,
                image_url = card_data.image_url,
                card_metadata = card_data.metadata
            )
            new_cards.append(new_card)
        except Exception as e:
           errors.append({"row": index, "error": str(e), "data": row})
    
    if errors:
        return{
            "status":"error",
            "message":"CSV validation failed. No data was saved",
            "details": errors
        }
    db.add_all(new_cards)
    await db.commit()
    return {"status": "success", "cards_added": len(new_cards)}


@router.put("/card/{card_id}")
async def update_card(
    card_id:uuid.UUID,
    card_data: CardUpdate,
    db: AsyncSession = Depends(get_async_session),
    user: User =Depends(current_active_user),
):
    result = await db.execute(update(Card)
                              .where(Card.card_id == card_id)
                              .values(**card_data.model_dump(exclude_unset=True))
                              .returning(Card))

    updated_card = result.scalar_one_or_none()
    if not updated_card:
        raise HTTPException(status_code=404, detail="Card not found")

    await db.commit()
    
    return {"message": "Card updated successfully", "card": updated_card}



@router.patch("/card/{card_id}/image")
async def update_card_image(
    card_id: uuid.UUID,
    file: UploadFile = File(...),
    user:User =Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    try:
        check_card = await db.execute(select(Card).where(Card.card_id == card_id))
        if not check_card.scalar_one_or_none():
          raise HTTPException(status_code=404, detail="Card not found")  
        file_content = await file.read()
        upload_result = imagekit.files.upload(
            file=file_content,
            file_name=file.filename,
            use_unique_file_name=True,
            tags=["back-end-upload"],
            folder="/cards"
        )
        updated_img =CardImageUpdate(
             image_url= upload_result.url
         )
        result = await db.execute(update(Card)
                                  .where(Card.card_id == card_id)
                                  .values(**updated_img.model_dump(exclude_unset=True))
                                  .returning(Card))
        updated_card = result.scalar_one_or_none()
        if not updated_card:
            raise HTTPException(status_code=404, detail="Card not found")

        await db.commit()
        
        return {"message": "Card updated successfully", "card": updated_card}
    except Exception as e:
        print(f"Error: {e}") 
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
            await file.close()