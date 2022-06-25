#include <DHT.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include "secrets.h"


const char* ssid = SECRET_SSID;
const char* password = SECRET_PASS;

// domain
const char* mqtt_server = "zetmio.tk";

//#define mqtt_user "openhab"
//#define mqtt_password "PASS"

#define humidity_topic "esp8266/dht/humidity"
#define temperature_topic "esp8266/dht/temperature"
#define DHTPIN D6
#define DHTTYPE DHT11
long lastMsg = 0;
DHT dht(DHTPIN, DHTTYPE);


WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
 
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("1377e149-9bdb-4912-888f-5f4ec1840cd1")) {
    //if (client.connect("ESP8266Client", mqtt_user, mqtt_password)) {
      Serial.println(" connected");
      client.subscribe("esp8266/dht/onoff_input");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  long now = millis();
  if (now - lastMsg > 5000) {
    lastMsg = now;
     
    int hum = dht.readHumidity();
    int temp = dht.readTemperature();
    if (isnan(hum) || isnan(temp)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }
  
    client.publish(humidity_topic, String(temp).c_str(),true);
    client.publish(temperature_topic, String(hum).c_str(),true);
    Serial.print(temp);
    Serial.print(" ");
    Serial.print(hum);
    Serial.print("\t\t");
    delay(500);
 
  }
}
 
void callback(char* topic, byte* payload, unsigned int length) {

  String topicStr = topic;
  Serial.print(topic);

  String messageTemp;
  
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
    messageTemp += (char)payload[i];
  }
  Serial.println();

if (topicStr == "esp8266/dht/onoff_input")
    {
     Serial.print("Message from  manual_input ist ");
     if(messageTemp == "on"){
       //digitalWrite(Relejs, HIGH);
       Serial.println("start");
       client.publish("esp8266/dht/ventilator", "Start", false);
       }
     else if (messageTemp == "off"){
       //digitalWrite(Relejs, LOW);
       Serial.println("stop");
       client.publish("esp8266/dht/ventilator", "Stop", false);
       }
     }
}
