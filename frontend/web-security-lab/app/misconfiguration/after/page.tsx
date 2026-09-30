import { ModuleShell } from "@/components/ModuleShell";
import { MisconfigurationDemo } from "@/components/MisconfigurationDemo";

export default function Page() {
  return (
    <ModuleShell
      title="Security Misconfiguration — after"
      mode="secure"
      description="Exceptions return a generic message (details go to server-side logs instead), no internal configuration is exposed, and standard defensive headers are sent."
    >
      <MisconfigurationDemo mode="secure" />
    </ModuleShell>
  );
}
