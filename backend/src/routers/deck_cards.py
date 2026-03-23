import uuid
from datetime import datetime, timezone
import io
import csv
import json
from src.db import Card, Deck
from src.db import get_async_session, User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, insert
from src.images import imagekit
from fastapi import  File, UploadFile, Form, Depends, APIRouter, HTTPException
from src.schemas import CardCSVRow, DeckCreate, CardUpdate, CardImageUpdate, DeckUpdate
from src.users import  current_active_user
import re

router = APIRouter()

@router.get("/list")
async def get_decks(db: AsyncSession= Depends(get_async_session)):
    result = await db.execute(select(Deck).where(Deck.is_deleted == False).order_by(Deck.created_at.desc()))
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
        deck_type = deck_in.deck_type,
        deck_content = deck_in.deck_content
    )
    db.add(new_deck)
    await db.commit()
    await db.refresh(new_deck)
    return {"status":"success", "deck": new_deck}


@router.delete("/{deck_id}")
async def delete_deck(
    deck_id: uuid.UUID,
    db: AsyncSession = Depends(get_async_session),
    user: User =Depends(current_active_user)
):
    try: 
        now = datetime.now(timezone.utc)
        result = await db.execute(update(Deck)
                                  .where(Deck.deck_id == deck_id)
                                  .values(is_deleted=True, deleted_at=now)
                                  .returning(Deck.deck_id)
                                  )
        deck = result.scalars().first()
        if not deck:
            raise HTTPException(status_code=404, detail="Deck not found")
        await db.execute(
            update(Card)
            .where(Card.deck_id== deck_id)
            .values(is_deleted=True, deleted_at=now)
        )
        await db.commit()
        return {"message": "Deck moved to trash"} 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/{deck_id}")
async def update_deck(
    deck_data: DeckUpdate,
    deck_id: uuid.UUID,
    db: AsyncSession = Depends(get_async_session),
    user: User =Depends(current_active_user)
):
    try:
        result = await db.execute(update(Deck)
                                .where(Deck.deck_id == deck_id)
                                .values(**deck_data.model_dump(exclude_unset=True))
                                .returning(Deck))
        updated_deck = result.scalar_one_or_none()
        if not updated_deck:
            raise HTTPException(status_code=404, detail="Card not found")
        
        await db.commit()


    except HTTPException as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/deck/{deck_id}/restore")
async def restore_deck(deck_id: uuid.UUID, db: AsyncSession = Depends(get_async_session)):
    await db.execute(
        update(Deck)
        .where(Deck.deck_id == deck_id)
        .values(is_deleted=False, deleted_at=None)
    )
    # Also restore the cards
    await db.execute(
        update(Card).where(Card.deck_id == deck_id).values(is_deleted=False)
    )
    await db.commit()
    return {"message": "Deck restored"}
# Cards endpoints
@router.get("/{deck_id}/cards")
async def get_cards( deck_id:uuid.UUID,db: AsyncSession= Depends(get_async_session)):
    result = await db.execute(select(Card).where(Card.deck_id == deck_id).order_by(Card.card_suit.desc()))
    cards = [row[0] for row in result.all()]
    return {"cards": cards}



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

@router.post("/deck/{deck_id}/upload-cards")
async def upload_cards_robust(
    deck_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_async_session)
):
    REQUIRED_HEADERS = {"Card Number & Name", "suit", "image_url", "position"}

    content = await file.read()
    f = io.StringIO(content.decode('utf-8'))
    reader = csv.DictReader(f)

    # Clean header names (strip whitespace)
    reader.fieldnames = [name.strip() for name in reader.fieldnames] if reader.fieldnames else []
    csv_headers = set(reader.fieldnames) if reader.fieldnames else set()

    # Check that all required headers are present
    missing = REQUIRED_HEADERS - csv_headers
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid CSV structure. Missing columns: {', '.join(missing)}"
        )

    # Determine extra headers (everything except required)
    extra_headers = csv_headers - REQUIRED_HEADERS

    # Helper to convert a header into a JSON‑friendly key (snake_case, lowercase)
    def clean_header(header: str) -> str:
        # Replace any non‑alphanumeric character with underscore, then lower
        cleaned = re.sub(r'[^a-zA-Z0-9]+', '_', header.strip().lower())
        return cleaned

    # Create mapping from original header to cleaned key for all extra columns
    header_to_cleaned = {h: clean_header(h) for h in extra_headers}

    new_cards = []
    errors = []

    for line_num, row in enumerate(reader, start=2):  # line 2 = first data row
        try:
            # Build metadata dictionary from all extra columns
            metadata_dict = {}
            for orig_header, cleaned_key in header_to_cleaned.items():
                # If the header exists in this row (it always does), add its value
                if orig_header in row:
                    metadata_dict[cleaned_key] = row[orig_header]

            # Create the new card record
            new_cards.append({
                "deck_id": deck_id,
                "card_position": int(row.get("position")),
                "card_name": row["Card Number & Name"],
                "suit": row.get("suit" ),  # suit is required, but fallback provided
                "image_url": row.get("image_url"),        # required, but .get for safety
                "card_metadata": json.dumps(metadata_dict),    # store all extra info as JSON
                "is_deleted": False
            })

        except Exception as e:
            errors.append(f"Line {line_num}: Unexpected error ({str(e)})")

    if errors:
        return {
            "status": "partial_failure",
            "message": "Some rows were invalid. No cards were saved.",
            "errors": errors
        }

    if new_cards:
        await db.execute(insert(Card), new_cards)
        await db.commit()

    return {"message": f"Successfully uploaded {len(new_cards)} cards."}