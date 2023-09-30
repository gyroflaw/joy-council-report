import React, { useCallback, useEffect, useState } from "react";
import ReactJson from "react-json-view";

import { useRpc } from "@/hooks";
import { generateReport1 } from "@/helpers";

export default function Report1() {
  const { api } = useRpc();
  const [report1, setReport1] = useState({});

  const [loading, setLoading] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<number | undefined>(
    undefined
  );
  const [block, setBlock] = useState(0);

  useEffect(() => {
    (async () => {
      if (!api) return;
      const blockHeader = await api.rpc.chain.getHeader();
      const currentBlockNumber = blockHeader.number.toNumber();
      setCurrentBlock(currentBlockNumber);
      setBlock(currentBlockNumber);
    })();
  }, [api]);

  const generate = useCallback(async () => {
    if (!api) return;
    setLoading(true);

    const [report1] = await Promise.all([generateReport1(api, block)]);
    setReport1(report1);

    setLoading(false);
  }, [api, block]);

  return (
    <div className="prose max-w-3xl m-auto mt-4 rounded-sm p-2 border-2 border-[#fff]">
      <h3>Given Block Stats</h3>
      <div className="rounded-sm p-2 mt-4 border-2 border-[#fff]">
        <div>
          Current block number: {currentBlock ? currentBlock : "Loading..."}
        </div>
        <label>Block:</label>
        <input
          type="number"
          value={block}
          onChange={(e) => setBlock(parseInt(e.target.value, 10))}
        />
        <button
          className="btn mr-0 my-5 mx-4"
          onClick={generate}
          disabled={!api || loading}
        >
          {loading ? "Generating..." : "Generate report"}
        </button>
      </div>

      <ReactJson src={report1} theme="monokai" collapsed />
    </div>
  );
}
