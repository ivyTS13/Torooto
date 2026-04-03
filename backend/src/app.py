from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Depends
from src.schemas import UserRead, UserCreate, UserUpdate
from src.users import auth_backend, current_active_user, fastapi_users
from src.routers.deck_cards import router as deck_router
from src.routers.pile_content import router as pile_router
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(fastapi_users.get_auth_router(
    auth_backend), prefix="/auth/jwt", tags=["auth"])
app.include_router(fastapi_users.get_register_router(
    UserRead, UserCreate), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_reset_password_router(),
                   prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_verify_router(
    UserRead), prefix="/auth", tags=["auth"])
app.include_router(fastapi_users.get_users_router(
    UserRead, UserUpdate), prefix="/users", tags=["users"])
app.include_router(
    deck_router,
    prefix="/decks",       
    tags=["Decks"], 
)
app.include_router( pile_router)
