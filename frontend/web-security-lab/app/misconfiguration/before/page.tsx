import { ModuleShell } from "@/components/ModuleShell";
import { MisconfigurationDemo } from "@/components/MisconfigurationDemo";

export default function Page() {
  return (
    <ModuleShell
      title="Security Misconfiguration — before"
      mode="vulnerable"
      description="Unhandled exceptions leak stack traces and environment details, an /info endpoint exposes the raw connection string, and no defensive security headers are sent."
    >
      <MisconfigurationDemo mode="vulnerable" />
    </ModuleShell>
  );
}
