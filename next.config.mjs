const DEFAULT_API_BASE_URL = '/v1';

function safeApiOrigin(value) {
  if (!value || value.startsWith('/')) return DEFAULT_API_BASE_URL;
  try {
    return new URL(value).origin;
  } catch {
    return DEFAULT_API_BASE_URL;
  }
}

const isDev = process.env.NODE_ENV === 'development';
const connectSrc = safeApiOrigin(process.env.NEXT_PUBLIC_API_BASE_URL);

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  `script-src 'self'${isDev ? " 'unsafe-inline' 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${connectSrc}`,
  'upgrade-insecure-requests',
].join('; ');

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
