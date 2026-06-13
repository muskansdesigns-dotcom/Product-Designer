import './globals.css';

export const metadata = {
  title: 'Product Designer — Cinematic Portfolio',
  description:
    'A premium, cinematic portfolio hero experience blending AI-generated identity, cinematic storytelling, and modern frontend engineering.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
