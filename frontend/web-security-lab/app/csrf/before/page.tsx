import { ModuleShell } from "@/components/ModuleShell";
import { CsrfDemo } from "@/components/CsrfDemo";

export default function Page() {
  return (
    <ModuleShell
      title="CSRF — before"
      mode="vulnerable"
      description="The transfer endpoint trusts the ambient auth cookie alone, with no anti-forgery token and no SameSite protection. Log in, then click the attack simulation to see a foreign origin move money on your behalf."
    >
      <CsrfDemo mode="vulnerable" />
    </ModuleShell>
  );
}
