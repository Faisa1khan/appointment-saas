import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Arrivo',
    short_name: 'Arrivo',
    description: 'Modern multi-tenant booking and reservation platform for service businesses.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#09090b', // Default dark theme background
    icons: [
      {
        src: '/icon192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
