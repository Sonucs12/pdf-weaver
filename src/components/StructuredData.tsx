import Script from "next/script";

export function StructuredData({
  data,
  id = "structured-data",
}: {
  data: any;
  id?: string;
}) {
  if (!data) return null;
  // If data is an array, render one <Script> per schema object
  if (Array.isArray(data)) {
    return (
      <>
        {data.map((schema, idx) => (
          <Script
            key={id + "-" + idx}
            id={id + "-" + idx}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            strategy="afterInteractive"
          />
        ))}
      </>
    );
  }
  // Otherwise, render a single <Script>
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      strategy="afterInteractive"
    />
  );
}