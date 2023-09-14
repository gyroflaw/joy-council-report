import React, { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ReactJson from "react-json-view";

import { CouncilSelect } from "@/components";
import { useRpc } from "@/hooks";
import { generateReport } from "@/helpers";
import { useSelectedCouncil } from "@/store";

const content = `A paragraph with *emphasis* and **strong importance**.`;

export default function Home() {
  const { council, setCouncil } = useSelectedCouncil();
  const { api, connectionState } = useRpc();
  const [report, setReport] = useState({});
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async () => {
    if (!council || !api) return;
    setLoading(true);
    const report = await generateReport(api, council);
    setReport(report);
    setLoading(false);
  }, [api, council]);

  return (
    <div className="prose max-w-3xl m-auto mt-4">
      <CouncilSelect council={council} onChange={setCouncil} />
      {api ? (
        <div>Connected to joystream node</div>
      ) : (
        <div>{connectionState}</div>
      )}
      <button
        className="btn mr-0 mt-5"
        onClick={generate}
        disabled={!council || !api || loading}
      >
        {loading ? "Generating..." : "Generate report"}
      </button>

      <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} />
      <ReactJson src={report} theme="monokai" />
    </div>
  );
}
