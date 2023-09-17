import { Grid } from "@mui/material";
import { observer } from "mobx-react-lite";
import mqtt from "mqtt/dist/mqtt";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import appStore, { IAppStore } from "../modells/state";
import HIstoryChart from "./HIstoryChart";
import ManualDevice from "./ManualDevice";
import NowTempHum from "./NowTempHum";

export const mqttTopic = "termostat/#";
export const tempHumidityTopic = "termostat/temphum";
export const termostatOnOffTopic = "termostat/onoff_input";
export const coolfunOnOffTopic = "termostat/coolfun";

/**
 * TemperatureHumidityPage component
 * @description This component initialize the mqtt connection and contains/shows the components:
 * - ManualDevice - set/show status of a MQTT device
 * - NowTemHum - show/manual the current temperature & humidity from a MQTT device
 * - HIstoryChart - show all measurements from an API (temperature & humidity)
 *
 * @return {JSX.Element}
 */
const TemperatureHumidityPage = () => {
  const [client, setClient] = useState<mqtt.MqttClient>();
  const [store, setStore] = useState<IAppStore>();

  useEffect(() => {
    setStore(appStore);
  }, []);

  useEffect(() => {
    if (store !== undefined) {
      mqttConnect();
    }

    return () => {
      mqttDisconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  useEffect(() => {
    if (client) {
      client.on("connect", () => {
        appStore.setMqttStatus(true);
        console.log("MQTT Connected");
        appStore.mqttStatus && mqttSubscribe(mqttTopic); // activate mqtt subscription
      });
      client.on("error", (err) => {
        console.error("MQTT Connection error: ", err);
        client.end();
      });
      client.on("reconnect", () => {
        appStore.setMqttStatus(true);
        console.log("MQTT Reconnection");
      });
      client.on("message", (_topic, message) => {
        const payloadMessage = { topic: _topic, message: message.toString() };

        if (payloadMessage.message !== "refreshData") {
          if (_topic === tempHumidityTopic) {
            const mqttMessage = JSON.parse(payloadMessage.message);
            // console.log("MQTT Message", mqttMessage);
            appStore.setMqttTempHumidity(mqttMessage); // life data from MQTT
            appStore.setDataTempHumidity(); // history data from API server
          } else if (_topic === coolfunOnOffTopic) {
            appStore.setCoolFan(/^true$/i.test(payloadMessage.message));
          }
        }
      });
    }

    return () => {
      mqttDisconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  const mqttConnect = async () => {
    const setup = store?.mqttSettings;

    const clientMqtt = mqtt.connect(
      `${setup?.protocol}://${setup?.host}:${setup?.port}/mqtt`,
      setup?.options
    );
    setClient(clientMqtt);
    appStore.setMqttStatus(true);
  };

  const mqttDisconnect = () => {
    console.log("MQTT disconnect");
    if (client) {
      try {
        client.end(false, () => {
          appStore.setMqttStatus(false);
          console.log("disconnected successfully");
        });
      } catch (error) {
        console.log("disconnect error:", error);
      }
    }
  };

  const mqttPublish = (topic: string, payload: string) => {
    if (client) {
      client.publish(topic, payload, (error) => {
        if (error) {
          console.log("Publish error: ", error);
        }
      });
    }
  };

  const mqttSubscribe = (topic: string) => {
    if (client) {
      console.log("MQTT subscribe ", topic);
      const clientMqtt = client.subscribe(
        topic,
        {
          qos: 0,
          rap: false,
          rh: 0,
        },
        (error) => {
          if (error) {
            console.log("MQTT Subscribe to topics error", error);
            return;
          }
        }
      );
      setClient(clientMqtt);
    }
  };

  // eslint-disable-next-line
  const mqttUnSubscribe = (topic: string) => {
    if (client) {
      const clientMqtt = client.unsubscribe(topic, (error: unknown) => {
        if (error) {
          console.log("MQTT Unsubscribe error", error);
          return;
        }
      });
      setClient(clientMqtt);
    }
  };

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <ManualDevice mqttPublish={mqttPublish} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <NowTempHum mqttSubscribe={mqttSubscribe} mqttPublish={mqttPublish} />
        </Grid>
        <Grid item xs={12}>
          <HIstoryChart />
        </Grid>
      </Grid>
      <br />
      <Link to="/settings">Go to Settings</Link>
    </div>
  );
};

export default observer(TemperatureHumidityPage);
