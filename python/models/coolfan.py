from pydantic import BaseModel

# Pydantic model for cool fan data

class CoolFanData(BaseModel):
    state: str
    timestamp: int