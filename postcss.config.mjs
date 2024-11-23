// next.config.mjs
/** @type {import('next').NextConfig} */
import * as _Sentry from "@sentry/nextjs";

const nextConfig = {
  reactStrictMode: true,
  // Add other configurations as needed
};

export default _Sentry.withSentryConfig(nextConfig, {
  // Sentry configuration options
  sentry: {
    hideSourceMaps: true,
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
  },
  // Optional: Manually configure source map uploading
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});