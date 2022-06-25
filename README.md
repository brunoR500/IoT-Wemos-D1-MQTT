# IoT Wemos D1 MQTT

A simple system created for remote control of electronic devices in a home,  either automatically or manually as required. The main focus is to create an economical, expandable and easy-to-manage system.  

Communication between the various devices is mainly through the use of the MQTT protocol.

<img src="file:///home/leonis/.var/app/com.github.marktext.marktext/config/marktext/images/2022-06-25-21-16-39-MQTT_schema.png" title="" alt="" data-align="center">

### Description

- **Arduino** (publish/subscribe) sends the temperature and humidity with the sensor DHT11 and switches an electrical device (e.g. **ventilator**)

- **MQTT broker** is installed on a VM from Google Cloud and manages all the publish and subcribe MQTT between connected devices

- **Controller** (publish/subscribe) automatically controls the temperature and sends "on/off" to turn on and off, e.g., a "fan." 

- **Save_data** ( subscribe ) saves from the corresponding topics (temperature and humidity) to a text file

- **BackupData.txt** 
  
  ```
  Humidity  : 24    12:34:00
  Temperatur: 52    12:34:00
  Humidity  : 23    12:35:00
  Temperatur: 53    12:35:00
  ```

### Used Tools

- Board Wemos D1 Mini ESP8266

- Sensor DHT11

- VM e2-micro-instance - Google Cloud

- Raspberry Pi 4

- MQTT

- Arduino
