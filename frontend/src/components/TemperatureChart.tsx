import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface ChartPoint {
  machine_id: number;
  temperature: number;
  pressure: number;
  vibration: number;
}

interface Props {
  data: ChartPoint[];
}

export function TemperatureChart({ data }: Props) {
  return (
    <div className="chart-card">
      <h3>Temperature Analysis</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="machine_id" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="temperature"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}