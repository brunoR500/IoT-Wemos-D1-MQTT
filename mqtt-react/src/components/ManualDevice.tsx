import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { Button, Card, Stack } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import appStore from "../modells/state";
import {
  coolfunOnOffTopic,
  termostatOnOffTopic,
} from "./TemperatureHumidityPage";

type Props = {
  mqttPublish: (topic: string, payload: string) => void;
};
/**
 * ManualDevice component
 * @description This component is responsible for:
 * - showing current status of the device (e.g. fan OFF or ON)
 * - set the device connect per MQTT (ON or OFF)
 *
 * @param {(topic: string, payload: string) => void} mqttPublish - MQTT method to publish values to a topic
 * @return {JSX.Element}
 */
const ManualDevice = (props: Props) => {
  const stateDevice = appStore.coolFan?.state;

  const [onOff, setOnOff] = useState(stateDevice);

  useEffect(() => {
    props.mqttPublish(coolfunOnOffTopic, "refreshData");
  });

  return (
    <Card style={{ padding: "30px 0px" }}>
      <Stack alignItems="center" spacing={4}>
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          <LightbulbIcon fontSize="large" />
          <p>
            Device Status:{" "}
            <span style={{ color: stateDevice ? "green" : "red" }}>
              {stateDevice?.toString()}
            </span>
          </p>
        </Stack>

        <Button
          variant="contained"
          onClick={() => {
            setOnOff(!onOff);
            props.mqttPublish(termostatOnOffTopic, JSON.stringify(onOff));
          }}
        >
          {onOff ? "SET OFF" : "SET ON"}
        </Button>
      </Stack>
    </Card>
  );
};

export default observer(ManualDevice);
