import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CouncilSelect } from "@/components";
import { useSelectedCouncil } from "@/store";
import { getBlockHash } from "@/api";

const content = `A paragraph with *emphasis* and **strong importance**.`;

export default function Home() {
  const { council, setCouncil } = useSelectedCouncil();

  useEffect(() => {
    (async () => {
      if (!council) return;
      const blockhash = await getBlockHash(council.electedAt.number);
      console.log(blockhash);
    })();
  }, [council]);

  return (
    <div className="prose max-w-3xl m-auto mt-4">
      <CouncilSelect council={council} onChange={setCouncil} />
      <button className="btn mr-0 mt-5">Generate report</button>
      <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} />
    </div>
  );
}
