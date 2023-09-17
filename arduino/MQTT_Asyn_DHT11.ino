#include <DHT.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "secrets.h"

const char *ssid = SECRET_SSID;
const char *password = SECRET_PASS;
const char *mqtt_server = "broker.emqx.io";
const int mqttPort = 1883;
const char *mqttUser = "emqx_test";
const char *mqttPassword = "emqx_test";

const int pinRelay = 5;

#define temp_humidity_topic "termostat/temphum"
#define termostat_on_off_topic "termostat/onoff_input"
#define coolfan_on_off_topic "termostat/coolfan"
#define DHTPIN D6
#define DHTTYPE DHT11
long lastMsg = 0;
DHT dht(DHTPIN, DHTTYPE);

WiFiClient espClient;
PubSubClient client(espClient);

void setup()
{
  Serial.begin(115200);
  pinMode(pinRelay, OUTPUT);
  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, mqttPort);
  client.setCallback(callback);
}

void setup_wifi()
{
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect()
{
  while (!client.connected())
  {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP8266Client", mqttUser, mqttPassword))
    {
      Serial.println("connected");
      client.subscribe(termostat_on_off_topic);
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println("try again in 5 seconds");
      delay(5000);
    }
  }
}

void tempHumidity()
{
  int hum = dht.readHumidity();
  int temp = dht.readTemperature();
  if (isnan(hum) || isnan(temp))
  {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  StaticJsonBuffer<300> JSONbuffer;
  JsonObject &JSONencoder = JSONbuffer.createObject();
  JSONencoder["device"] = "ESP8266";
  JSONencoder["sensorType"] = "DHT11";
  JSONencoder["temperature"] = temp;
  JSONencoder["humidity"] = hum;

  char JSONmessageBuffer[100];
  JSONencoder.printTo(JSONmessageBuffer, sizeof(JSONmessageBuffer));

  Serial.println(JSONmessageBuffer);

  if (client.publish(temp_humidity_topic, JSONmessageBuffer, true) == true)
  {
    Serial.println("Success sending message");
  }
  else
  {
    Serial.println("Error sending message");
  }
  Serial.println("-------------");
  delay(500);
}

void loop()
{
  if (!client.connected())
  {
    reconnect();
  }
  client.loop();

  long now = millis();
  if (now - lastMsg > 5000)
  {
    lastMsg = now;
    tempHumidity();
  }
}

void callback(char *topic, byte *payload, unsigned int length)
{

  String topicStr = topic;
  Serial.print(topic);

  String messageTemp;

  for (int i = 0; i < length; i++)
  {
    Serial.print((char)payload[i]);
    messageTemp += (char)payload[i];
  }
  Serial.println();

  if (topicStr == termostat_on_off_topic)
  {
    Serial.print("Message from %s", topicStr);
    if (messageTemp == true)
    {
      digitalWrite(pinRelay, HIGH);
      Serial.println("Relay ON");
      client.publish(coolfan_on_off_topic, true);
    }
    else if (messageTemp == false)
    {
      digitalWrite(pinRelay, LOW);
      Serial.println("Relay OFF");
      client.publish(coolfan_on_off_topic, false);
    }
  }
  else if (topicStr == temp_humidity_topic)
  {
    Serial.print("Message from %s", topicStr);
    if (messageTemp == "refreshData")
    {
      Serial.println("publish data");
      tempHumidity();
    }
  }
  else if (topicStr == coolfan_on_off_topic)
  {
    Serial.print("Message from %s", topicStr);
    if (messageTemp == "refreshData")
    {
      Serial.println("start");
      if (digitalRead(pinRelay))
      {
        client.publish(coolfan_on_off_topic, true);
      }
      else
      {
        client.publish(coolfan_on_off_topic, false);
      }
    }
  }
}
