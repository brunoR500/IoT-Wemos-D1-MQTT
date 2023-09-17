import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import DrawerAppBar from "./components/DrawerAppBar";
import SettingsPage from "./components/SettingsPage";
import TemperatureHumidityPage from "./components/TemperatureHumidityPage";

const App = () => {
  return (
    <Router>
      <div className="app">
        <DrawerAppBar />
        <br />
        <h1>MQTT Web App</h1>
        <Routes>
          <Route path="/" element={<TemperatureHumidityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
