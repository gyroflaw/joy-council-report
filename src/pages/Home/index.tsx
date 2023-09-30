import React from "react";

import { useRpc } from "@/hooks";
import Report1 from "./Report1";
import Weekly from "./Weekly";
import Council from "./Council";

export default function Home() {
  const { api, connectionState } = useRpc();

  return (
    <div className="prose max-w-3xl m-auto mt-4">
      {api ? (
        <div>✅ Connected to joystream node</div>
      ) : (
        <div>{connectionState}</div>
      )}
      <Report1 />
      <Weekly />
      <Council />
    </div>
  );
}
