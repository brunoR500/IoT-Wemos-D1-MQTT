import {
  Instance,
  applySnapshot,
  flow,
  onSnapshot,
  types,
} from "mobx-state-tree";

// MQTT options
const MqttOptions = types.model({
  clientId: types.string,
  username: types.string,
  password: types.string,
  clean: types.boolean,
  reconnectPeriod: types.number,
  connectTimeout: types.number,
});

// MQTT Settings
const MqttSettings = types.model({
  protocol: types.string,
  host: types.string,
  port: types.number,
  options: MqttOptions,
});

// Measurement - temperature and humidity
// The timestamp is set here by default due to a hardware limitation in arduino.
const DataTempHumidity = types.model({
  device: types.string,
  sensorType: types.string,
  humidity: types.number,
  temperature: types.number,
  timestamp: types.optional(types.number, Date.now()),
});

// Current status of the actuator. In this case, a fan
const CoolFan = types.model({
  state: types.boolean,
  timestamp: types.optional(types.number, Date.now()),
});

// Main MST-Store
const AppStore = types
  .model({
    coolFan: types.maybeNull(CoolFan),
    historyDataTempHumidity: types.maybeNull(types.array(DataTempHumidity)), // list for the chart
    mqttTempHumidity: types.maybeNull(DataTempHumidity),
    mqttSettings: MqttSettings,
    mqttStatus: types.maybeNull(types.boolean),
  })
  .actions((self) => {
    function setMqttSettings(settings: IMqttSettings) {
      self.mqttSettings = settings;
    }
    function setMqttStatus(status: boolean) {
      self.mqttStatus = status;
    }
    const setDataTempHumidity = flow(function* setDataTempHumidity() {
      try {
        const response: any = yield fetch(
          "http://localhost:5000/temphumidity",
          {
            method: "GET",
            credentials: "same-origin",
          }
        );

        if (response.status >= 200 && response.status < 300) {
          const data = yield response.json();

          // Check if self.historyDataTempHumidity is not null before applying snapshot
          if (self.historyDataTempHumidity !== null) {
            applySnapshot(self.historyDataTempHumidity, data); // Store data in measurements
          } else {
            // If it's null, initialize it with data
            self.historyDataTempHumidity = data;
          }
        } else if (response.status === 204) {
          throw new Error("There are no data available");
        } else {
          throw new Error("Bad status: " + response.status);
        }
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    });

    function setMqttTempHumidity(mqttTempHumidity: IDataTempHumidity) {
      if (self.mqttTempHumidity !== null) {
        applySnapshot(self.mqttTempHumidity, mqttTempHumidity);
      } else {
        // If it's null, initialize it with data
        self.mqttTempHumidity = mqttTempHumidity;
      }
    }

    function setCoolFan(state: boolean) {
      if (self.coolFan !== null) {
        self.coolFan.state = state;
        self.coolFan.timestamp = Date.now();
      } else {
        // Handle case where self.coolFan is null
        self.coolFan = CoolFan.create({ state });
      }
    }

    // after creation of the MST run setDataTempHumidity()
    function afterCreate() {
      setDataTempHumidity();
    }
    return {
      setMqttSettings,
      setMqttStatus,
      setDataTempHumidity,
      setMqttTempHumidity,
      afterCreate,
      setCoolFan,
    };
  })
  .views((self) => {
    function getLastDataTempHumidity() {
      if (self.historyDataTempHumidity) {
        const sortedData = self.historyDataTempHumidity.sort(
          (a, b) => a.timestamp - b.timestamp
        );

        return sortedData[0];
      }
    }

    return { getLastDataTempHumidity };
  });

const storedState = sessionStorage.getItem("appState");
const initialState = storedState
  ? JSON.parse(storedState)
  : {
      mqttSettings: MqttSettings.create({
        // ws or wss
        protocol: "ws",
        host: "broker.emqx.io",
        // ws -> 8083; wss -> 8084
        port: 8083,
        options: MqttOptions.create({
          clientId: "myuser" + Math.random().toString(16).substring(2, 8),
          username: "emqx_test",
          password: "emqx_test",
          clean: true,
          reconnectPeriod: 1000,
          connectTimeout: 30 * 1000,
        }),
      }),
    };
// Update sessionStorage. Usefull especially to save persistent state also after refresh of the Page
if (storedState) {
  const parsedState = JSON.parse(storedState);
  if (AppStore.is(parsedState)) {
    Object.assign(initialState, parsedState);
  }
}

const appStore = AppStore.create(initialState);

// Listen for state changes and update sessionStorage
onSnapshot(appStore, (snapshot) => {
  sessionStorage.setItem("appState", JSON.stringify(snapshot));
});

export default appStore;

// MST-Types usable in typescript/react
export interface IDataTempHumidity extends Instance<typeof DataTempHumidity> {}
export interface IMqttOptions extends Instance<typeof MqttOptions> {}
export interface IMqttSettings extends Instance<typeof MqttSettings> {}
export interface IAppStore extends Instance<typeof AppStore> {}
