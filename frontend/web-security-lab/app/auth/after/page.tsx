import { ModuleShell } from "@/components/ModuleShell";
import { AuthDemo } from "@/components/AuthDemo";

export default function Page() {
  return (
    <ModuleShell
      title="Broken Authentication & Session — after"
      mode="secure"
      description="The session cookie is HttpOnly, Secure and SameSite=Strict, a brand-new session id is issued on every login, and repeated failed logins are rate-limited."
    >
      <AuthDemo mode="secure" />
    </ModuleShell>
  );
}
