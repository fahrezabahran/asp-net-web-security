import { ModuleShell } from "@/components/ModuleShell";
import { SqlInjectionDemo } from "@/components/SqlInjectionDemo";

export default function Page() {
  return (
    <ModuleShell
      title="SQL Injection — before"
      mode="vulnerable"
      description="The search query is built by interpolating raw user input directly into the SQL text. Try the attack payload to dump every product regardless of the search term."
    >
      <SqlInjectionDemo mode="vulnerable" />
    </ModuleShell>
  );
}
