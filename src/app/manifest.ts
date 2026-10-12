import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    scope: '/',
    name: 'فرایند یار',
    short_name: 'فرایند یار',
    description: 'راهنمای هوشمند، تعاملی و گام‌به‌گام فرایندهای اداری و سازمانی',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    launch_handler: {
      client_mode: 'navigate-existing',
    },
    background_color: '#f8fafc',
    theme_color: '#2563eb',
    dir: 'rtl',
    lang: 'fa',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
