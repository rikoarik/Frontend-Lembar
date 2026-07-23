function apiOrigin(value) {
  if (!value || value.startsWith('/')) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const isDev = process.env.NODE_ENV === 'development';
const shouldUpgradeInsecureRequests =
  process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://');
const connectSrc = ["connect-src 'self'", apiOrigin(process.env.NEXT_PUBLIC_API_BASE_URL)]
  .filter(Boolean)
  .join(' ');

// ponytail: Next App Router still needs inline bootstrap/runtime script allowance here.
// Upgrade path: move to nonce/hash-based CSP once the app owns a full nonce pipeline.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://raw.githubusercontent.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  connectSrc,
  shouldUpgradeInsecureRequests ? 'upgrade-insecure-requests' : null,
]
  .filter(Boolean)
  .join('; ');

const permissionsPolicy = [
  'camera=()',
  'microphone=()',
  'geolocation=()',
  'payment=()',
  'usb=()',
  'magnetometer=()',
  'gyroscope=()',
  'accelerometer=()',
].join(', ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: permissionsPolicy },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;
