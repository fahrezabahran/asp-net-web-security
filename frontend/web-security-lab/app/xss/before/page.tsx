import { ModuleShell } from "@/components/ModuleShell";
import { XssDemo } from "@/components/XssDemo";

export default function Page() {
  return (
    <ModuleShell
      title="XSS — before"
      mode="vulnerable"
      description="Comments and search results are rendered back as raw, unescaped HTML with no Content-Security-Policy. Post the default script payload, then open the rendered view — it executes."
    >
      <XssDemo mode="vulnerable" />
    </ModuleShell>
  );
}
