import React, { useEffect, useState } from "react";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

import { getCouncilVideoChartData } from "@/api";
import { useSelectedCouncil } from "@/store";

type DailyData = {
  date: Date;
  count: number;
};

export default function Charts() {
  const { council } = useSelectedCouncil();
  const [data, setData] = useState<DailyData[]>([]);
  useEffect(() => {
    (async () => {
      if (!council) return;

      const data = await getCouncilVideoChartData(council);
      setData(data);
    })();
  }, [council]);

  return (
    <div>
      <h3>Videos uploaded</h3>
      {data.length > 0 && (
        <BarChart width={730} height={250} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(val: Date) => {
              const date = val.toLocaleDateString("en-US");
              return date.slice(0, date.length - 5);
            }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="Videos" />
        </BarChart>
      )}
    </div>
  );
}
