import paho.mqtt.subscribe as subscribe
import time

broker = "zetmio.tk"
topic = "esp8266/dht/#"

def on_message_save(client, userdata, message):
    msg = (message.payload).decode('utf-8')
    t = time.localtime()
    current_time = time.strftime("%H:%M:%S", t)

    print("%s %s \t %s" % (message.topic, msg, current_time))
    
    try:
        with open('./test.txt','a') as f:
            if message.topic == "esp8266/dht/temperature":
                f.write("Temperatur : "  + msg + "\t" + current_time + "\n" )
            elif message.topic == "esp8266/dht/humidity":
                f.write("Humidity   : "  + msg + "\t" + current_time + "\n" )
    except:
        print("Fehler")

subscribe.callback(on_message_save, topic, hostname=broker)
