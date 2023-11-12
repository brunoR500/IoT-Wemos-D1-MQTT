import sqlite3

connection = sqlite3.connect("mqttStore.db", check_same_thread=False)
cursor = connection.cursor()

async def get_temphumidity_data():
    cursor.execute("SELECT * FROM temphumidity")
    data = cursor.fetchall()
    columns = [column[0] for column in cursor.description]
    result = [dict(zip(columns, row)) for row in data]
    return result

async def get_coolfan_data():
    cursor.execute("SELECT * FROM coolfan")
    data = cursor.fetchall()
    columns = [column[0] for column in cursor.description]
    result = [dict(zip(columns, row)) for row in data]
    return result

async def insert_temphumidity_data(device, sensorType, temperature, humidity, timestamp):
    cursor.execute(
        "INSERT INTO temphumidity (device, sensorType, temperature, humidity, timestamp) VALUES (?, ?, ?, ?, ?)",
        (device, sensorType, temperature, humidity, timestamp),
    )
    connection.commit()

async def insert_coolfan_data(state, timestamp):
    cursor.execute("INSERT INTO coolfan (state, timestamp) VALUES (?, ?)", (state, timestamp))
    connection.commit()

def close_connection():
    cursor.close()
    connection.close()