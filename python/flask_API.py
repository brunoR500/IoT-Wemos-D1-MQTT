import sqlite3
from flask import Flask, jsonify
from flask_cors import CORS

# SQLite Connection
connection = sqlite3.connect("mqttStore.db", check_same_thread=False)
cursor = connection.cursor()

# Flask API
app = Flask(__name__)
CORS(app)


@app.route("/temphumidity", methods=["GET"])
def get_temphumidity_data():
    cursor.execute("SELECT * FROM temphumidity")
    data = cursor.fetchall()
    columns = [column[0] for column in cursor.description]
    result = [dict(zip(columns, row)) for row in data]
    return jsonify(result)


@app.route("/coolfan", methods=["GET"])
def get_coolfan_data():
    cursor.execute("SELECT * FROM coolfan")
    data = cursor.fetchall()
    columns = [column[0] for column in cursor.description]
    result = [dict(zip(columns, row)) for row in data]
    return jsonify(result)


@app.route("/")
def hello():
    return "Hello, World!"


# Run Flask App
if __name__ == "__main__":
    try:
        app.run(debug=True)
    except KeyboardInterrupt:
        # Close SQLite connection
        cursor.close()
        connection.close()
