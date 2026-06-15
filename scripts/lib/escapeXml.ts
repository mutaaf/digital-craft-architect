// Ticket 0055 - shared XML-escape helper extracted from
// scripts/generate-rss.ts (the blog RSS generator) so the new changelog RSS
// generator and the existing blog RSS generator read from one definition,
// per the 2026-05-25 mirror-source rule. Same five replacements, same order,
// behavior preserved byte-for-byte.
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
