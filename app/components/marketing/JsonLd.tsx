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
      // ponytail: noDangerouslySetInnerHtml lint — data is controlled JSON-LD, never user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
