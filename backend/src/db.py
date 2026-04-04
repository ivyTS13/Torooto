from collections.abc import AsyncGenerator
import uuid

from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Integer, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, relationship
from datetime import datetime, timezone
from fastapi_users.db import SQLAlchemyUserDatabase, SQLAlchemyBaseUserTableUUID
from fastapi import Depends
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")


class Base(DeclarativeBase):
    pass


class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "users"
    profile_image_url = Column(String, nullable=True)
    name = Column(String, nullable=True)
    birthday = Column(Date, nullable=True)
    zodiac_sign = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    piles = relationship("Pile", back_populates="user")


class Deck(Base):
    __tablename__ = "decks"
    deck_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deck_name = Column(String, nullable=False)
    deck_type = Column(String, nullable=False)
    deck_content = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))
    is_deleted = Column(Boolean, default= False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    cards = relationship("Card", back_populates="deck",
                         cascade="all, delete-orphan")


class Card(Base):
    __tablename__ = "cards"
    card_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deck_id = Column(UUID(as_uuid=True), ForeignKey(
        "decks.deck_id"), nullable=False)
    card_name = Column(String, nullable=False)
    card_suit = Column(String, default="None", nullable=False)
    card_metadata = Column(JSONB, default={}, nullable=False)
    image_url = Column(String, nullable=True)
    card_position = Column(Integer, nullable=False)
    is_deleted = Column(Boolean, default= False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    deck = relationship("Deck", back_populates="cards")
    pile_contents = relationship("PileContent", back_populates="card")

class Pile(Base):
    __tablename__ = "piles"
    pile_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id"), nullable=False)
    drawn_at = Column(DateTime(timezone=True),
                      default=lambda: datetime.now(timezone.utc))
    is_deleted = Column(Boolean, default= False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    user = relationship("User", back_populates="piles")
    pile_contents = relationship("PileContent", back_populates="pile")


class PileContent(Base):
    __tablename__ = "pile_contents"
    pile_content_id = Column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pile_id = Column(UUID(as_uuid=True), ForeignKey(
        "piles.pile_id"), nullable=False)
    card_id = Column(UUID(as_uuid=True), ForeignKey(
        "cards.card_id"), nullable=False)
    reversed_card = Column(Boolean, default=False, nullable=False)
    position = Column(Integer, nullable=False)
    is_deleted = Column(Boolean, default= False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    pile = relationship("Pile", back_populates="pile_contents")
    card = relationship("Card", back_populates="pile_contents")


engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
