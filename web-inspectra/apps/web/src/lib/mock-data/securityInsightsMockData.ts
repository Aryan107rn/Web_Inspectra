import type { SecurityInsight } from "@/lib/types";

export const securityInsightsMockData: SecurityInsight[] = [
  { id: "sec-1", label: "HTTPS", status: "pass", summary: "Site is served entirely over HTTPS.", detail: "All resources load over a valid TLS connection with no mixed content detected." },
  { id: "sec-2", label: "Content Security Policy", status: "warning", summary: "CSP header is present but permissive.", detail: "The current policy allows 'unsafe-inline' scripts, which weakens protection against cross-site scripting." },
  { id: "sec-3", label: "SSL Certificate", status: "pass", summary: "Certificate is valid and not expiring soon.", detail: "Issued by a trusted authority with 68 days remaining before renewal is required." },
  { id: "sec-4", label: "Cookies", status: "warning", summary: "Some cookies missing Secure/SameSite flags.", detail: "2 of 9 cookies do not set the Secure or SameSite attribute, increasing CSRF exposure." },
  { id: "sec-5", label: "Security Headers", status: "fail", summary: "Missing Strict-Transport-Security header.", detail: "Without HSTS, browsers may allow a downgrade to an insecure HTTP connection." },
  { id: "sec-6", label: "Mixed Content", status: "pass", summary: "No mixed content detected.", detail: "All subresources are loaded over HTTPS with no insecure fallbacks found." },
];
