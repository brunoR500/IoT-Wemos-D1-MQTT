import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Card, IconButton, Stack } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import appStore from "../modells/state";
import { tempHumidityTopic } from "./TemperatureHumidityPage";

type Props = {
  mqttSubscribe: (topic: string) => void;
  mqttPublish: (topic: string, payload: string) => void;
};
/**
 * NowTempHum component
 * @description This component is responsible for:
 * - showing the current temperature & humidity of a MQTT device
 * - manual update the current temperature & humidity
 *
 * @param {void} mqttSubscribe - MQTT subscription method to receive data from a topic
 * @param {void} mqttPublish - MQTT Publish method to send data to topic
 * @return {JSX.Element}
 */
const NowTempHum = (props: Props) => {
  useEffect(() => {
    props.mqttPublish(tempHumidityTopic, "refreshData");
  });

  const mqttTempHumidity = appStore.mqttTempHumidity;

  return (
    <Card
      sx={{
        height: "100%",
        minHeight: "150px",
        display: "flex",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <Box sx={{ position: "absolute", top: "10px", right: "10px" }}>
        <Stack direction="row" alignItems="center">
          {mqttTempHumidity?.timestamp && (
            <div style={{ fontSize: 10 }}>
              {new Date(mqttTempHumidity.timestamp).toLocaleString("de-DE")}
            </div>
          )}
          <IconButton
            onClick={() => {
              console.log("refresh");
              props.mqttPublish(tempHumidityTopic, "refreshData");
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyItems="center"
        spacing={6}
        useFlexGap
        flexWrap="wrap"
      >
        <Stack spacing={1} alignItems="center" justifyContent="center">
          <div>Temperature</div>
          <div>
            <b>{mqttTempHumidity?.temperature} °C</b>
          </div>
        </Stack>
        <Stack spacing={1} alignItems="center" justifyContent="center">
          <div>Humidity</div>
          <div>
            <b>{mqttTempHumidity?.humidity} %</b>
          </div>
        </Stack>
      </Stack>
    </Card>
  );
};

export default observer(NowTempHum);
