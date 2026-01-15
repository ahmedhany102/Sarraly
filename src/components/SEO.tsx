import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
}

// Default site values
const DEFAULTS = {
    title: 'Sarraly - سرعلي',
    description: 'منصتك الأولى للتجارة الإلكترونية في مصر. تسوق من أفضل المتاجر والبائعين',
    image: '/og-image.png',
    url: 'https://sarraly.com',
    type: 'website' as const,
};

const SEO: React.FC<SEOProps> = ({
    title,
    description,
    image,
    url,
    type = 'website',
}) => {
    const siteTitle = title ? `${title} | ${DEFAULTS.title}` : DEFAULTS.title;
    const siteDescription = description || DEFAULTS.description;
    const siteImage = image || DEFAULTS.image;
    const siteUrl = url || DEFAULTS.url;

    // JSON-LD Schema for structured data
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Sarraly",
        "alternateName": ["سرعلي", "Sarraly App", "سرعلى"],
        "url": "https://sarraly.app",
        "description": "منصة سرعلي - بوابتك لعالم التجارة الإلكترونية المتكامل. ابدأ، بع، وانمُ بلا حدود.",
        "image": "https://sarraly.app/logo.png",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://sarraly.app/products?search={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{siteTitle}</title>
            <meta name="description" content={siteDescription} />

            {/* Open Graph (Facebook/WhatsApp) */}
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={siteDescription} />
            <meta property="og:image" content={siteImage} />
            <meta property="og:url" content={siteUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={DEFAULTS.title} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={siteDescription} />
            <meta name="twitter:image" content={siteImage} />

            {/* Additional SEO */}
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={siteUrl} />

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
        </Helmet>
    );
};

export default SEO;
