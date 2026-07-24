/**
 * JsonLd — inject a JSON-LD structured-data block into the <head>.
 * Usage:
 *   <JsonLd schema={{ "@context": "https://schema.org", "@type": "WebSite", ... }} />
 *   <JsonLd schema={[schemaA, schemaB]} />  ← graph array
 */
interface JsonLdProps {
  schema: Record<string, unknown> | Record<string, unknown>[];
}

export default function JsonLd({ schema }: JsonLdProps) {
  const data = Array.isArray(schema)
    ? { '@context': 'https://schema.org', '@graph': schema }
    : schema;

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled JSON-LD, never user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
