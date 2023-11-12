from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import utils.database as database
import uvicorn
from routers.router import router
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # Close the SQLite connection
    database.close_connection()

# FastAPI App
app = FastAPI(lifespan=lifespan)

# # CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("main_fastAPI:app", host="0.0.0.0", port=5000, reload=True)