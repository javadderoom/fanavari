import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    scope: '/',
    name: 'سامانه فرآیندنما | راهنمای تعاملی و بصری فرایندهای سازمانی',
    short_name: 'فرآیندنما',
    description: 'جستجو، مشاهده فلوچارت زنده و اجرای گام‌به‌گام فرایندهای سازمانی و اداری با راهنمای جامع خطایابی',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
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
