import { useContext } from "react";
import { AgentReadyStateContext } from "./AgentReadyStateContext";

export function useAgentReady() {
  const context = useContext(AgentReadyStateContext);
  if (!context) throw new Error("useAgentReady must be used within an AgentReadyProvider");
  return context;
}
