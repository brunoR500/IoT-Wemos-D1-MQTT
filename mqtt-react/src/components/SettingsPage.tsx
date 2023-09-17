import { Button, Snackbar, Stack, TextField } from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { observer } from "mobx-react-lite";
import mqtt from "mqtt/dist/mqtt";
import React from "react";
import { Link } from "react-router-dom";
import appStore from "../modells/state";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
/**
 * SettingPage component
 * @description This component is responsible for setting the MQTT settings
 *
 * @return {JSX.Element}
 */
const SettingsPage = () => {
  const [open, setOpen] = React.useState(false);
  const [alert, setAlert] = React.useState("");

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const parsedValue = name === "port" ? parseInt(value, 10) : value;
    if (name === "host" || name === "port") {
      appStore.setMqttSettings({
        ...appStore.mqttSettings,
        [name]: parsedValue,
      });
    } else {
      appStore.setMqttSettings({
        ...appStore.mqttSettings,
        options: {
          ...appStore.mqttSettings.options,
          [name]: parsedValue,
        },
      });
    }
  };

  return (
    <div>
      <h2>Settings</h2>
      <Stack spacing={2} sx={{ marginRight: "20%", maxWidth: "400px" }}>
        <TextField
          id="host"
          name="host"
          label="Host"
          defaultValue={appStore.mqttSettings?.host}
          onChange={handleInputChange}
        />
        <TextField
          id="port"
          name="port"
          label="Port"
          type="number"
          defaultValue={appStore.mqttSettings?.port}
          onChange={handleInputChange}
        />
        <TextField
          id="username"
          name="username"
          label="Username"
          defaultValue={appStore.mqttSettings?.options.username}
          onChange={handleInputChange}
        />
        <TextField
          id="password"
          name="password"
          label="Password"
          defaultValue={appStore.mqttSettings?.options.password}
          onChange={handleInputChange}
        />
      </Stack>
      <br />
      <Button
        variant="contained"
        onClick={() => {
          const setup = appStore.mqttSettings;

          const clientMqtt = mqtt.connect(
            `${setup.protocol}://${setup.host}:${setup.port}/mqtt`,
            setup.options
          );

          clientMqtt.on("error", (err) => {
            console.error("MQTT Connection error: ", err);
            handleClick();
            setAlert("error");
            clientMqtt.end();
          });

          if (clientMqtt) {
            clientMqtt.on("connect", () => {
              console.log("MQTT successfully connected");
              handleClick();
              setAlert("ok");
              clientMqtt.end();
            });
            clientMqtt.on("error", (err) => {
              console.error("MQTT Connection error: ", err);
              handleClick();
              setAlert("error");
              clientMqtt.end();
            });
          }
        }}
      >
        Try connection
      </Button>
      <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={alert === "ok" ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {alert === "ok"
            ? "MQTT successfully connected"
            : "MQTT could not be connected"}
        </Alert>
      </Snackbar>
      <br />
      <br />
      <Link to="/">Back to Home-Page</Link>
    </div>
  );
};

export default observer(SettingsPage);
