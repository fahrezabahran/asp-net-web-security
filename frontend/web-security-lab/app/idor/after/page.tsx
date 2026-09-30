import { ModuleShell } from "@/components/ModuleShell";
import { IdorDemo } from "@/components/IdorDemo";

export default function Page() {
  return (
    <ModuleShell
      title="IDOR — after"
      mode="secure"
      description="The same lookup now checks that the resource's owner matches the current user before returning it, responding 404 either way to avoid leaking whether the id exists."
    >
      <IdorDemo mode="secure" />
    </ModuleShell>
  );
}
