from fastapi import APIRouter

from models.temphumidity import TempHumidityData
from models.coolfan import CoolFanData
from utils.database import get_temphumidity_data, get_coolfan_data

router = APIRouter()

@router.get("/")
async def hello():
    return {"message": "Hello, World!"}

@router.get("/temphumidity", response_model=list[TempHumidityData])
async def get_temphumidity():
    # Get the temperature and humidity data from the database
    data = await get_temphumidity_data()

    # Convert the data to a list of TempHumidityData objects
    result = [TempHumidityData(**dict(row)) for row in data]

    return result

@router.get("/coolfan", response_model=list[CoolFanData])
async def get_coolfan():
    # Get the cool fan data from the database
    data = await get_coolfan_data()

    # Convert the data to a list of CoolFanData objects
    result = [CoolFanData(**row) for row in data]

    return result