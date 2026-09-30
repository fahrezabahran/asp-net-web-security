import { ModuleShell } from "@/components/ModuleShell";
import { XssDemo } from "@/components/XssDemo";

export default function Page() {
  return (
    <ModuleShell
      title="XSS — after"
      mode="secure"
      description="User-controlled output is HTML-encoded before being embedded, and a strict Content-Security-Policy blocks any script execution even as a defense-in-depth backstop."
    >
      <XssDemo mode="secure" />
    </ModuleShell>
  );
}
