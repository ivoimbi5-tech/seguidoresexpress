import { Service } from './types';

export const SERVICES: Service[] = [
  {
    id: 'tt-followers-1',
    name: 'Seguidores TikTok',
    platform: 'tiktok',
    type: 'followers',
    pricePer1000: 5000, // 500kz per 100
    minQuantity: 100,
    maxQuantity: 50000,
  },
  {
    id: 'ig-followers-1',
    name: 'Seguidores Instagram',
    platform: 'instagram',
    type: 'followers',
    pricePer1000: 3000, // 300kz per 100
    minQuantity: 100,
    maxQuantity: 50000,
  },
  {
    id: 'fb-followers-1',
    name: 'Seguidores Facebook',
    platform: 'facebook',
    type: 'followers',
    pricePer1000: 4500,
    minQuantity: 100,
    maxQuantity: 15000,
  },
  {
    id: 'tw-followers-1',
    name: 'Seguidores Twitter',
    platform: 'twitter',
    type: 'followers',
    pricePer1000: 6000,
    minQuantity: 100,
    maxQuantity: 10000,
  },
];

export const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: 'Instagram' },
  { id: 'tiktok', name: 'TikTok', icon: 'Music2' },
  { id: 'facebook', name: 'Facebook', icon: 'Facebook' },
  { id: 'twitter', name: 'Twitter', icon: 'Twitter' },
];
