import React, { useCallback, useState } from "react";
import ReactJson from "react-json-view";

import { useRpc } from "@/hooks";
import { generateReport2 } from "@/helpers";

import Charts from "./Charts";

export default function Weekly() {
  const { api } = useRpc();

  const [report2, setReport2] = useState({});
  const [loading, setLoading] = useState(false);

  const [startBlock, setStartBlock] = useState(0);
  const [endBlock, setEndBlock] = useState(0);

  const generate = useCallback(async () => {
    if (!api) return;
    setLoading(true);

    const [report2] = await Promise.all([
      generateReport2(api, startBlock, endBlock),
    ]);

    setReport2(report2);

    setLoading(false);
  }, [api, startBlock, endBlock]);

  return (
    <div className="rounded-sm p-2 mt-4 border-2 border-[#fff]">
      <h3>Weekly Report Data</h3>
      <div className="rounded-sm p-2 border-2 border-[#fff]">
        <label>Start block:</label>
        <input
          type="number"
          value={startBlock}
          onChange={(e) => setStartBlock(parseInt(e.target.value, 10))}
        />
        <label>End block:</label>
        <input
          type="number"
          value={endBlock}
          onChange={(e) => setEndBlock(parseInt(e.target.value, 10))}
        />
        <button
          className="btn mr-0 my-5 mx-4"
          onClick={generate}
          disabled={!api || loading}
        >
          {loading ? "Generating..." : "Generate report"}
        </button>
      </div>
      <ReactJson src={report2} theme="monokai" collapsed />
      <Charts start={startBlock} end={endBlock} />
    </div>
  );
}
