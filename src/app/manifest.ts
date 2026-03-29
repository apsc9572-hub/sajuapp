import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '청아매당 운세 & 사주',
    short_name: '청아매당',
    description: '전통의 혜안으로 풀어내는 프리미엄 사주 및 운세 서비스, 청아매당',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
