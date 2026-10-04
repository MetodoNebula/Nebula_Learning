import type { Metadata, Viewport } from 'next';
import './globals.css';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#111715',
};
export const metadata: Metadata = {
  title: 'Nebula Tech · Laboratorio de idiomas',
  description:
    'Demo de aprendizaje de vocabulario entre inglés, francés, español, italiano y alemán, con imagen, traducción, opción múltiple y huecos.',
  manifest: '/manifest.webmanifest',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
