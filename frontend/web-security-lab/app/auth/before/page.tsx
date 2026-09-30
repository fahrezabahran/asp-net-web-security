import { ModuleShell } from "@/components/ModuleShell";
import { AuthDemo } from "@/components/AuthDemo";

export default function Page() {
  return (
    <ModuleShell
      title="Broken Authentication & Session — before"
      mode="vulnerable"
      description="The session cookie is missing HttpOnly/Secure, never rotates on login (session fixation), and login attempts are never rate-limited."
    >
      <AuthDemo mode="vulnerable" />
    </ModuleShell>
  );
}
