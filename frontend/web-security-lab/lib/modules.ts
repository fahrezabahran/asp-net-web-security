export interface ModuleInfo {
  slug: string;
  title: string;
  summary: string;
}

export const modules: ModuleInfo[] = [
  {
    slug: "csrf",
    title: "Cross-Site Request Forgery (CSRF)",
    summary: "State-changing requests riding on an authenticated cookie.",
  },
  {
    slug: "xss",
    title: "Cross-Site Scripting (XSS)",
    summary: "Untrusted input rendered back as executable HTML.",
  },
  {
    slug: "sql-injection",
    title: "SQL Injection",
    summary: "User input concatenated directly into a SQL query.",
  },
  {
    slug: "auth",
    title: "Broken Authentication & Session Management",
    summary: "Weak cookie flags, no session rotation, no brute-force protection.",
  },
  {
    slug: "idor",
    title: "Insecure Direct Object Reference (IDOR)",
    summary: "Resource access without an ownership check.",
  },
  {
    slug: "misconfiguration",
    title: "Security Misconfiguration",
    summary: "Verbose errors and missing security headers.",
  },
];
