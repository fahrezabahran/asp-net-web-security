import { ModuleShell } from "@/components/ModuleShell";
import { CsrfDemo } from "@/components/CsrfDemo";

export default function Page() {
  return (
    <ModuleShell
      title="CSRF — after"
      mode="secure"
      description="The transfer endpoint requires a per-session anti-CSRF token sent in a custom header (double-submit cookie pattern), which a cross-origin attacker page cannot read or set. The attack simulation should now be rejected."
    >
      <CsrfDemo mode="secure" />
    </ModuleShell>
  );
}
