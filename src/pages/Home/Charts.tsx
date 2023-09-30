import React, { useCallback, useEffect, useState } from "react";
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
  getVideoNftChartData,
  getChannelChartData,
  getMembershipChartData,
  getStorageChartData,
} from "@/api";
import { useRpc } from "@/hooks";

type DailyData = {
  date: Date;
  count: number;
};

function JoyChart({ data, title }: { data: DailyData[]; title: string }) {
  if (data.length === 0) return <></>;

  return (
    <div className="p-2">
      <h3>{title}</h3>
      <BarChart width={730} height={250} data={data}>
        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
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
      <ReactJson src={{ title, data }} theme="monokai" collapsed />
    </div>
  );
}

export default function Charts({ start, end }: { start: number; end: number }) {
  const [startTimestamp, setStartTimestamp] = useState<Date | undefined>(
    undefined
  );
  const [endTimestamp, setEndTimestamp] = useState<Date | undefined>(undefined);
  const [videoData, setVideoData] = useState<DailyData[]>([]);
  const [videoNftData, setVideoNftData] = useState<DailyData[]>([]);
  const [channelData, setChannelData] = useState<DailyData[]>([]);
  const [membershipData, setMembershipData] = useState<DailyData[]>([]);
  const [storageData, setStorageData] = useState<DailyData[]>([]);
  const [loading] = useState(false);

  const { api } = useRpc();

  useEffect(() => {
    if (!api) return;

    (async () => {
      const startHash = await api.rpc.chain.getBlockHash(start);
      const startTimestamp = new Date(
        (await (await api.at(startHash)).query.timestamp.now()).toNumber()
      );
      setStartTimestamp(startTimestamp);
      const endHash = await api.rpc.chain.getBlockHash(
        end === 0 ? undefined : end
      );
      const endTimestamp = new Date(
        (await (await api.at(endHash)).query.timestamp.now()).toNumber()
      );
      setEndTimestamp(endTimestamp);
    })();
  }, [api, start, end]);

  const generate = useCallback(() => {
    if (!startTimestamp || !endTimestamp) return;

    getVideoChartData(startTimestamp, endTimestamp).then(setVideoData);

    getVideoNftChartData(startTimestamp, endTimestamp).then(setVideoNftData);

    getChannelChartData(startTimestamp, endTimestamp).then(setChannelData);

    getMembershipChartData(startTimestamp, endTimestamp).then(
      setMembershipData
    );

    getStorageChartData(startTimestamp, endTimestamp).then(setStorageData);
  }, [startTimestamp, endTimestamp]);

  return (
    <div>
      <button
        className="btn mr-0 my-5 mx-4"
        onClick={generate}
        disabled={!api || loading}
      >
        {loading ? "Generating..." : "Generate Chart"}
      </button>
      <JoyChart data={videoData} title="Videos" />
      <JoyChart data={videoNftData} title="Video NFTs" />
      <JoyChart data={channelData} title="Non-empty channels" />
      <JoyChart data={membershipData} title="Membership" />
      <JoyChart data={storageData} title="Storage(MBytes)" />
    </div>
  );
}
