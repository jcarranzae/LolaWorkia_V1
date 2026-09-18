import { User } from '@/types';
import { LOLA_IMAGES } from '@/constants/images';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'miembro',
    name: 'Elena Rostova',
    email: 'elena@ejemplo.com',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    subscribedSince: '2025-11-15',
    plan: 'VIP Club'
  },
  {
    id: 'usr-2',
    username: 'admin',
    name: 'Lola Workia (Admin)',
    email: 'lola@lolaworkia.com',
    role: 'admin',
    avatarUrl: LOLA_IMAGES.AVATAR,
    subscribedSince: '2024-01-01',
    plan: 'Pro Creator'
  },
  {
    id: 'usr-3',
    username: 'carlos_vip',
    name: 'Carlos Mendoza',
    email: 'carlos@ejemplo.com',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    subscribedSince: '2026-01-10',
    plan: 'VIP Club'
  }
];
