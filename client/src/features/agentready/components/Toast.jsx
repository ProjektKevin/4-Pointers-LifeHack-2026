import { useAgentReady } from "../useAgentReady";

export default function Toast() {
  const { toast } = useAgentReady();

  return (
    <div className={`toast${toast.visible ? " show" : ""}`} role="status" aria-live="polite">
      {toast.message}
    </div>
  );
}
