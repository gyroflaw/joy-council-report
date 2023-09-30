import React, { useCallback, useEffect, useState } from "react";
import ReactJson from "react-json-view";

import { CouncilSelect } from "@/components";
import { useRpc } from "@/hooks";
import { generateReport4 } from "@/helpers";
import { useSelectedCouncil } from "@/store";

export default function Council() {
  const { council, setCouncil } = useSelectedCouncil();
  const { api } = useRpc();

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

    const [report4] = await Promise.all([
      generateReport4(api, startBlock, endBlock),
    ]);

    setReport4(report4);
    setLoading(false);
  }, [api, startBlock, endBlock]);

  return (
    <div className="prose max-w-3xl m-auto mt-4">
      <div className="rounded-sm p-2 mt-4 border-2 border-[#fff]">
        <h3>Council Report Data</h3>
        <div className="rounded-sm p-2 border-2 border-[#fff]">
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
            disabled={!api || loading}
          >
            {loading ? "Generating..." : "Generate report"}
          </button>
        </div>

        <ReactJson src={report4} theme="monokai" collapsed />
      </div>
    </div>
  );
}
