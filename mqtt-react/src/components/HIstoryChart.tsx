import { Card } from "@mui/material";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { observer } from "mobx-react-lite";
import { Line } from "react-chartjs-2";
import appStore from "../modells/state";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  // aspectRatio: 2,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: false,
      text: "History Diagram",
    },
  },
  scales: {
    y: {
      display: true,
      title: {
        display: true,
        text: "Value",
      }, // Hide Y axis labels
    },
    x: {
      display: true, // Hide X axis labels
      title: {
        display: true,
        text: "Time",
      },
      ticks: {
        display: false,
      },
    },
  },
};
/**
 * HIstoryChart component
 * @description This component is responsible for showing in line chart,
 * all the measurements like temperature and humidity from an API
 *
 * @return {JSX.Element}
 */
const HIstoryChart = () => {
  const labels = appStore.historyDataTempHumidity?.map((el) =>
    new Date(el.timestamp * 1000).toLocaleString("de-DE")
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Temperature",
        data: appStore.historyDataTempHumidity?.map((el) => el.temperature),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Humidity",
        data: appStore.historyDataTempHumidity?.map((el) => el.humidity),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <div>
      <Card sx={{ padding: "30px" }}>
        <div>HIstoryChart</div>
        <div
          style={{
            margin: "5px 20px",
            width: "100%",
            minHeight: "300px",
            position: "relative",
          }}
        >
          <Line options={options} data={data} />
        </div>
      </Card>
    </div>
  );
};

export default observer(HIstoryChart);
