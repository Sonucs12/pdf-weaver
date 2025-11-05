export const siteConfig = {
  name: 'PDF Weaver',
  description: 'Convert any PDF into structured, editable text.',
  url: 'https://pdfweaver.app', // Replace with your actual domain
  defaultImage: 'https://pdfweaver.app/og-image.jpg', // Add your default OG image
  twitterHandle: '@pdfweaver', // Add your Twitter handle
};

type FAQItem = {
  question: string;
  answer: string;
};

type BreadcrumbItem = {
  name: string;
  url: string;
};

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  canonical?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  faq?: FAQItem[];
  breadcrumbs?: BreadcrumbItem[];
  organization?: {
    name: string;
    url: string;
    logo?: string;
  };
  locale?: string;
  alternateLocales?: { locale: string; url: string }[];
};

export function generateMetadata({
  title,
  description,
  path,
  type = "website",
  keywords = [],
  image,
  imageAlt,
  noIndex = false,
  noFollow = false,
  canonical,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  faq = [],
  breadcrumbs = [],
  organization,
  locale = "en_US",
  alternateLocales = [],
}: MetadataInput) {
  // Construct full URL - check if path is already absolute
  const fullUrl = path.startsWith('http') ? path : `${siteConfig.url}${path}`;
  
  // Use canonical if provided, otherwise use fullUrl
  const canonicalUrl = canonical || fullUrl;
  
  // Use custom image or default
  const ogImage = image || siteConfig.defaultImage;
  const ogImageAlt = imageAlt || title;

  const metadata = {
    title,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    authors: author ? [{ name: author }] : undefined,
    
    // Robots meta - always included with smart defaults
    robots: {
      index: !noIndex,
      follow: !noFollow,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    // Canonical URL - always included
    alternates: {
      canonical: canonicalUrl,
      ...(alternateLocales.length > 0 && {
        languages: alternateLocales.reduce((acc, alt) => {
          acc[alt.locale] = alt.url;
          return acc;
        }, {} as Record<string, string>),
      }),
    },

    // Open Graph - always included
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: siteConfig.name,
      locale,
      type,
      images: [
        {
          url: ogImage,
          alt: ogImageAlt,
          width: 1200,
          height: 630,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },

    // Twitter Card - always included
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: siteConfig.twitterHandle,
      site: siteConfig.twitterHandle,
      images: [ogImage],
    },

    // Additional meta tags - always included
    other: {
      'theme-color': '#ffffff',
      'application-name': siteConfig.name,
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': siteConfig.name,
      'format-detection': 'telephone=no',
      'mobile-web-app-capable': 'yes',
    },
  };

  const schema: any[] = [];

  // FAQ Schema
  if (faq.length > 0) {
    schema.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    });
  }

  // Breadcrumb Schema
  if (breadcrumbs.length > 0) {
    schema.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  // WebSite Schema - always included
  schema.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });

  // WebPage Schema - always included
  schema.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: fullUrl,
    ...(publishedTime && { datePublished: publishedTime }),
    ...(modifiedTime && { dateModified: modifiedTime }),
    ...(author && {
      author: {
        "@type": "Person",
        name: author,
      },
    }),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  });

  // Organization Schema
  if (organization) {
    schema.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: organization.name,
      url: organization.url,
      logo: organization.logo
        ? {
            "@type": "ImageObject",
            url: organization.logo,
          }
        : undefined,
    });
  }

  // Article Schema (if type is article)
  if (type === "article" && publishedTime) {
    schema.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      image: ogImage,
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      author: author
        ? {
            "@type": "Person",
            name: author,
          }
        : undefined,
      publisher: organization
        ? {
            "@type": "Organization",
            name: organization.name,
            logo: organization.logo
              ? {
                  "@type": "ImageObject",
                  url: organization.logo,
                }
              : undefined,
          }
        : undefined,
    });
  }

  return { metadata, schema };
}

// Helper function to generate JSON-LD script tag
export function generateJsonLd(schema: any[]) {
  return schema.map((s) => ({
    type: 'application/ld+json',
    children: JSON.stringify(s),
  }));
}