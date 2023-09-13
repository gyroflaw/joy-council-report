import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CouncilSelect } from "@/components";
import { useSelectedCouncil } from "@/store";

const content = `A paragraph with *emphasis* and **strong importance**.`;

export default function Home() {
  const { council, setCouncil } = useSelectedCouncil();

  return (
    <div className="prose max-w-3xl m-auto mt-4">
      <CouncilSelect council={council} onChange={setCouncil} />
      <button className="btn mr-0 mt-5">Generate report</button>
      <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} />
    </div>
  );
}
