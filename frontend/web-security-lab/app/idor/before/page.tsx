import { ModuleShell } from "@/components/ModuleShell";
import { IdorDemo } from "@/components/IdorDemo";

export default function Page() {
  return (
    <ModuleShell
      title="IDOR — before"
      mode="vulnerable"
      description="Any authenticated user can fetch any document by id — there is no check that the requester actually owns it."
    >
      <IdorDemo mode="vulnerable" />
    </ModuleShell>
  );
}
