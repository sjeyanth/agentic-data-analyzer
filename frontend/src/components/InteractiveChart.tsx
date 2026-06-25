import { useMemo, useState } from "react";
import type { ChartRow } from "../types/chart";


import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";


interface InteractiveChartProps {
    data: ChartRow[];
}

export function InteractiveChart({
    data,
}: InteractiveChartProps) {

    const columns = useMemo(() => {

        if (data.length === 0) {
            return [];
        }

        return Object.keys(data[0]);

    }, [data]);

    const [selectedXAxis, setSelectedXAxis] = useState("machine_id");

    const [selectedYAxis, setSelectedYAxis] = useState("temperature");

    const [chartType, setChartType] = useState("line");


    return (
        <div className="chart-controls">

    <label>

        X Axis

        <select
            value={selectedXAxis}
            onChange={(event) =>
                setSelectedXAxis(event.target.value)
            }
        >

            {columns.map((column) => (

                <option
                    key={column}
                    value={column}
                >
                    {column}
                </option>

            ))}

        </select>

    </label>
  <label>
     Y Axis

    <select
        value={selectedYAxis}
        onChange={(event) =>
            setSelectedYAxis(event.target.value)
        }
    >
        {columns.map((column) => (
            <option
                key={column}
                value={column}
            >
                {column}
            </option>
        ))}
    </select>
</label>


<div style={{ width: "100%", height: 400 }}>

    <ResponsiveContainer>

        <LineChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey={selectedXAxis} />

            <YAxis />

            <Tooltip />

            <Line
                type="monotone"
                dataKey={selectedYAxis}
                stroke="#10b981"
                strokeWidth={2}
            />

        </LineChart>

    </ResponsiveContainer>

</div>

</div>

        
    );
}