#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Apr 23 20:45:24 2018

@author: user

Quelle:  https://pypi.org/project/paho-mqtt/

"""
from threading import Thread 
import paho.mqtt.publish as publish
import paho.mqtt.subscribe as subscribe

broker = "zetmio.tk"
topic1 = "esp8266/dht/temperature"
topic2 = "esp8266/dht/onoff_input"
Tmin = 20
Tmax = 25

class myThread(Thread): 
    def __init__(self,callback, topic, broker): 
        Thread.__init__(self) 
        self.callback = callback
        self.topic = topic
        self.broker = broker 
        print('Client connected to',topic,'on',broker) 
    def run(self): 
        try:
            subscribe.callback(self.callback, self.topic, hostname=self.broker)
        finally:
            print('connection error to' + self.topic + 'on' + self.broker)


def on_message_publish(client, userdata, message):
    global Tmin
    global Tmax
    print("%s %s" % (message.topic, message.payload))
    if float(message.payload.decode()) < Tmin:
        print('ON')
        publish.single(topic2, "on", hostname=str(broker), port=1883, 
               client_id="1377e149-9bdb-4912-888f-5f4ec1840cd1", keepalive=60,
               will=None, auth=None, tls=None, 
               transport="tcp")
    else:
        print('OFF')
        publish.single(topic2, "off", hostname=str(broker), port=1883, 
               client_id="1377e149-9bdb-4912-888f-5f4ec1840cd1", keepalive=60,
               will=None, auth=None, tls=None, 
               transport="tcp")

def on_message_settings(client, userdata, message):
    global Tmin
    global Tmax
    print("%s %s" % (message.topic, message.payload))
    msg = str(message.payload.decode())

threads = [] 
print ('subscribe: ' + topic1)
newthread1 = myThread(on_message_publish,topic1,broker) 
newthread1.start() 
threads.append(newthread1)

for t in threads: 
    t.join() 

