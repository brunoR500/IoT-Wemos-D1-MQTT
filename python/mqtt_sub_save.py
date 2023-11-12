import utils.database as database
import paho.mqtt.subscribe as subscribe
import time
import random
import sqlite3
import json

# MQTT Configuration
broker = "broker.emqx.io"
port = 1883
topic = "termostat/#"
client_id = f"python-mqtt-{random.randint(0, 1000)}"

# SQLite Connection
connection = sqlite3.connect("mqttStore.db", check_same_thread=False)
cursor = connection.cursor()

# Create Tables if not exists
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS temphumidity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device TEXT,
        sensorType TEXT,
        temperature INTEGER,
        humidity INTEGER,
        timestamp INTEGER
    )
"""
)

cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS coolfan (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        state TEXT,
        timestamp INTEGER
    )
"""
)

# MQTT Callback Function
def on_message_save(client, userdata, message):
    timestamp = int(time.time())
    print(f"{message.topic} {message.payload.decode()} {timestamp}")

    if message.payload.decode() != "refreshData":
        msg = json.loads(message.payload.decode())

        if message.topic == "termostat/temphum":
            database.insert_temphumidity_data(
                msg["device"], msg["sensorType"], msg["temperature"], msg["humidity"], timestamp
            )
        elif message.topic == "termostat/coolfan":
            database.insert_coolfan_data(msg, timestamp)


# Start MQTT Subscriber
if __name__ == "__main__":
    try:
        subscribe.callback(on_message_save, topic, hostname=broker)
    except KeyboardInterrupt:
        print("Process interrupted by user. Cleaning up...")
        # Close SQLite connection
        cursor.close()
        connection.close()
