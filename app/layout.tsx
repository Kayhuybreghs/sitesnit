import type { Metadata } from "next";
import { runtime } from "../lib/server";
import "./globals.css";
import "./pages.css";
import "./direction.css";
import "./hero-motion.css";
import "./studio.css";
import './seo.css';
import './legal.css';
import { CookieConsent } from './cookie-consent';
import { routeCatalog } from '../lib/route-catalog';
import { business } from '../lib/business';
import { Navigation, Motion } from "./shell";
import { SiteFooter } from "./site-footer";
import { site } from "./site-data";
import { canIndexRequest } from './seo';
export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(site.origin),
    title: {
      default: "Sitesnit — webdesign Limburg",
      template: "%s | Sitesnit",
    },
    description:
      "Websites met een eigen gezicht en een helder verhaal. Sitesnit ontwerpt en bouwt voor ondernemers in Limburg.",
    icons: { icon: [{ url: '/brand/sitesnit-favicon-32x32.png', sizes: '32x32', type: 'image/png' }, { url: '/brand/sitesnit-favicon-192x192.png', sizes: '192x192', type: 'image/png' }], apple: '/brand/sitesnit-favicon-180x180.png' },
    robots: { index: await canIndexRequest(), follow: true },
    verification: { google: runtime().GOOGLE_SITE_VERIFICATION },
  };
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <head>
        <link
          rel="preload"
          href="/fonts/manrope.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Naar de inhoud
        </a>
        <Navigation />
        <main id="main">{children}</main>
        <SiteFooter />

        <Motion />
        <CookieConsent measurementId={runtime().GA4_MEASUREMENT_ID} privacyConfigurationVerified={runtime().GA4_PRIVACY_CONFIGURED === 'true'} publicPaths={routeCatalog.map(route => route.path)} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": site.origin + "/#organization",
              name: site.name,
              url: site.origin,
              ...(site.email ? { email: site.email } : {}),
              founder: { '@type': 'Person', '@id': site.origin + '/#kay', name: business.ownerName },
              address: {
                "@type": "PostalAddress",
                streetAddress: business.streetAddress,
                postalCode: business.postalCode,
                addressLocality: "Baarlo",
                addressRegion: "Limburg",
                addressCountry: "NL",
              },
              logo: site.origin + "/brand/sitesnit-favicon-512x512.png",
              areaServed: {
                "@type": "AdministrativeArea",
                name: "Limburg, Nederland",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
