from pydantic import BaseModel

# Pydantic model for temperature and humidity data

class TempHumidityData(BaseModel):
    device: str
    sensorType: str
    temperature: int
    humidity: int
    timestamp: int