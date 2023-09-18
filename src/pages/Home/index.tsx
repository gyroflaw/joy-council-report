import React, { useCallback, useEffect, useState } from "react";
import ReactJson from "react-json-view";

import { CouncilSelect } from "@/components";
import { useRpc } from "@/hooks";
import { generateReport2, generateReport4 } from "@/helpers";
import { useSelectedCouncil } from "@/store";
import Charts from "./Charts";
import Report1 from "./Report1";

export default function Home() {
  const { council, setCouncil } = useSelectedCouncil();
  const { api, connectionState } = useRpc();

  const [report2, setReport2] = useState({});
  const [report4, setReport4] = useState({});
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

    const [report2, report4] = await Promise.all([
      generateReport2(api, startBlock, endBlock),
      generateReport4(api, startBlock, endBlock),
    ]);

    setReport2(report2);
    setReport4(report4);
    setLoading(false);
  }, [api, startBlock, endBlock]);

  return (
    <div className="prose max-w-3xl m-auto mt-4">
      {api ? (
        <div>Connected to joystream node</div>
      ) : (
        <div>{connectionState}</div>
      )}
      <Report1 />
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

      <h4>Weekly Report Data</h4>
      <ReactJson src={report2} theme="monokai" collapsed />
      <h4>Council Report Data</h4>
      <ReactJson src={report4} theme="monokai" collapsed />
      <Charts />
    </div>
  );
}
