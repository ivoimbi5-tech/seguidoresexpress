import { Service } from './types';

export const SERVICES: Service[] = [
  {
    id: 'tt-followers-1',
    name: 'Seguidores TikTok',
    platform: 'tiktok',
    type: 'followers',
    pricePer1000: 5000, // 500kz per 100 = 5000kz per 1000
    minQuantity: 100,
    maxQuantity: 10000,
  },
  {
    id: 'ig-followers-1',
    name: 'Seguidores Instagram',
    platform: 'instagram',
    type: 'followers',
    pricePer1000: 3000, // 300kz per 100 = 3000kz per 1000
    minQuantity: 100,
    maxQuantity: 10000,
  },
];

export const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: 'Music2' },
  { id: 'instagram', name: 'Instagram', icon: 'Instagram' },
];
