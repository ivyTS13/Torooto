from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.schemas import UserRead, UserCreate, UserUpdate
from src.users import auth_backend, current_active_user, fastapi_users
from src.routers.deck_cards import router as deck_router
from src.routers.pile_content import router as pile_router
from src.routers.user_router import router as user_router
from fastapi.middleware.cors import CORSMiddleware
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
app.include_router( user_router)


origins = [
    "http://localhost:5173",  # Default Vite port
    "http://localhost:3000",  # Default CRA port
    "http://127.0.0.1:5173",
 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allows specific origins
    allow_credentials=True,           # Required if you use Cookies or Auth headers
    allow_methods=["*"],              # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],              # Allows all headers (Content-Type, Authorization, etc.)
)