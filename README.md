# IoT Wemos D1 MQTT

A basic system that can show and save real-time data such as temperature, humidity of a room. Also you have the ability to manage a device remotely and have the status of it.

Communication between the various devices is mainly through the use of the MQTT protocol.

<img src=".img/MQTT_schema.png" title="" alt="" data-align="center">

## Description

- **Arduino ESP8266** (publish/subscribe) sends the temperature and humidity with the sensor DHT11 and switches an electrical device (e.g. **fan**)

- **MQTT Broker** manages all the publish and subcribe MQTT between connected devices

- **Python MQTT** ( subscribe ) saves from the corresponding topics (e.g. temperature and humidity, device status) to a database (SQLite 3)

- **Python API** mainly are the APIs which provide in JSON format to the measurements saved in the database

- **WebApp React** (publish/subscribe)
  
  - shows current values (temperature & humidity) directly from MQTT
  - shows in a diagram all measurements/values from an API
  - remote control of an electronic device (example fan connected to relay in arduino) and give the status of the device

<img src=".img/img_1.png" title="home-react-webapp" alt="home-react-webapp" data-align="center">
<img src=".img/img_2.png" title="settings-react-webapp" alt="settings-react-webapp" data-align="center">

## Used Hardware

- Board Wemos D1 Mini ESP8266
- Sensor DHT11
- 5V Relay Songle

## Main used it-tools

- MobX-State-Tree (State management)
- React
- Flask python
- MQTT
- SQLite 3
- Material UI
- Chart.js

## Commands to start services

```bash
# run python scripts
cd python
# install dependecies
python3 -m venv my_env
source my_env/bin/activate
pip install -r requirements.txt
python3 flask_API.py
python3 mqtt_sub_save.py

# run the react web app
cd ../mqtt-react
npm install
npm start
```
