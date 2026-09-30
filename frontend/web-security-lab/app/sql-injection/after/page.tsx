import { ModuleShell } from "@/components/ModuleShell";
import { SqlInjectionDemo } from "@/components/SqlInjectionDemo";

export default function Page() {
  return (
    <ModuleShell
      title="SQL Injection — after"
      mode="secure"
      description="The same query, but the user input is always passed as a bound parameter, so the database treats it as literal data — never as SQL syntax."
    >
      <SqlInjectionDemo mode="secure" />
    </ModuleShell>
  );
}
