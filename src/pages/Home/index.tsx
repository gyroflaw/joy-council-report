import React, { useCallback, useEffect, useState } from "react";
import ReactJson from "react-json-view";

import { CouncilSelect } from "@/components";
import { useRpc } from "@/hooks";
import { generateReport } from "@/helpers";
import { useSelectedCouncil } from "@/store";
import Charts from "./Charts";

export default function Home() {
  const { council, setCouncil } = useSelectedCouncil();
  const { api, connectionState } = useRpc();
  const [report, setReport] = useState({});
  const [loading, setLoading] = useState(false);
  const [startBlock, setStartBlock] = useState(0);
  const [endBlock, setEndBlock] = useState(0);

  useEffect(() => {
    if (!council) return;
    setStartBlock(council.electedAt.number);

    if (council.endedAt) {
      setEndBlock(council.endedAt.number);
    }
  }, [council]);

  const generate = useCallback(async () => {
    if (!api) return;
    setLoading(true);

    const report = await generateReport(api, startBlock, endBlock);
    setReport(report);
    setLoading(false);
  }, [api, startBlock, endBlock]);

  return (
    <div className="prose max-w-3xl m-auto mt-4">
      {api ? (
        <div>Connected to joystream node</div>
      ) : (
        <div>{connectionState}</div>
      )}
      <CouncilSelect council={council} onChange={setCouncil} />

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
        disabled={!council || !api || loading}
      >
        {loading ? "Generating..." : "Generate report"}
      </button>

      <ReactJson src={report} theme="monokai" />
      <Charts />
    </div>
  );
}
