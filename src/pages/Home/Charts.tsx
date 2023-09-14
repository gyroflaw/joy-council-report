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
import ReactJson from "react-json-view";

import {
  getVideoChartData,
  getChannelChartData,
  getMembershipChartData,
} from "@/api";
import { useSelectedCouncil } from "@/store";

type DailyData = {
  date: Date;
  count: number;
};

function JoyChart({ data, title }: { data: DailyData[]; title: string }) {
  return (
    <div className="p-4">
      <h3>{title}</h3>
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
          <Bar dataKey="count" fill="#8884d8" name={title} />
        </BarChart>
      )}
      <ReactJson src={{ title, data }} theme="monokai" collapsed />
    </div>
  );
}

export default function Charts() {
  const { council } = useSelectedCouncil();
  const [videoData, setVideoData] = useState<DailyData[]>([]);
  const [channelData, setChannelData] = useState<DailyData[]>([]);
  const [membershipData, setMembershipData] = useState<DailyData[]>([]);
  useEffect(() => {
    (async () => {
      if (!council) return;

      const videoData = await getVideoChartData(
        new Date(council.electedAt.timestamp),
        council.endedAt ? new Date(council.endedAt.timestamp) : new Date()
      );
      setVideoData(videoData);

      const channelData = await getChannelChartData(
        new Date(council.electedAt.timestamp),
        council.endedAt ? new Date(council.endedAt.timestamp) : new Date()
      );
      setChannelData(channelData);

      const membershipData = await getMembershipChartData(
        new Date(council.electedAt.timestamp),
        council.endedAt ? new Date(council.endedAt.timestamp) : new Date()
      );
      setMembershipData(membershipData);
    })();
  }, [council]);

  return (
    <div>
      <JoyChart data={videoData} title="Videos" />
      <JoyChart data={channelData} title="Channels" />
      <JoyChart data={membershipData} title="Membership" />
    </div>
  );
}
