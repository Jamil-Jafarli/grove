export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiresPhoto: boolean;
  category: 'water' | 'waste' | 'nature' | 'transport' | 'energy' | 'food';
  xal: number;  // score for leaderboard (10-100)
  coin: number; // currency for prize wheel (0-10)
}

export const ALL_TASKS: TaskTemplate[] = [
  { id: 't1',  title: 'Su iç',                  description: 'Ən azı 2 litr su iç və şüşəni göstərərək şəkil çəkib yüklə.',             icon: '💧', requiresPhoto: true,  category: 'water',     xal: 30,  coin: 3  },
  { id: 't2',  title: 'Zibil yığ',               description: 'Kənardan bir zibil götür, zibil qutusuna at və şəkil çək.',               icon: '🗑️', requiresPhoto: true,  category: 'waste',     xal: 50,  coin: 5  },
  { id: 't3',  title: 'Piyada gəz',              description: 'Ən azı 15 dəqiqə piyada gəz, addım sayğacının şəklini yüklə.',            icon: '🚶', requiresPhoto: true,  category: 'transport', xal: 40,  coin: 4  },
  { id: 't4',  title: 'Plastik istifadə etmə',   description: 'Bu gün alış-verişdə öz torbanı istifadə et, şəkil çək.',                  icon: '🛍️', requiresPhoto: true,  category: 'waste',     xal: 40,  coin: 4  },
  { id: 't5',  title: 'Bitkini sula',             description: 'Evdəki bir bitkini sula və şəkil çəkib yüklə.',                           icon: '🌱', requiresPhoto: true,  category: 'nature',    xal: 20,  coin: 2  },
  { id: 't6',  title: 'İşıqları söndür',          description: 'İstifadə edilməyən otağın işığını söndür — şəkil çək.',                   icon: '💡', requiresPhoto: true,  category: 'energy',    xal: 20,  coin: 2  },
  { id: 't7',  title: 'Qida israfı yox',          description: 'Bu gün heç bir yemək atmadan ye, boş boşqabın şəklini çək.',              icon: '🥗', requiresPhoto: true,  category: 'food',      xal: 40,  coin: 4  },
  { id: 't8',  title: 'Duş zamanını azalt',       description: '5 dəqiqədən qısa duş al. Tapşırığı tamamladın? ✓ işarəsi qoy.',          icon: '🚿', requiresPhoto: false, category: 'water',     xal: 15,  coin: 1  },
  { id: 't9',  title: 'Ağac yaxınlığında şəkil',  description: 'Bir ağacın yanında selfie çək və yüklə.',                                 icon: '🌳', requiresPhoto: true,  category: 'nature',    xal: 35,  coin: 3  },
  { id: 't10', title: 'Elektrik cihazını söndür', description: 'Gündüz saatlarında standby-da olan bir cihazı tam söndür.',               icon: '🔌', requiresPhoto: false, category: 'energy',    xal: 15,  coin: 1  },
  { id: 't11', title: 'Velosiped / skuter',       description: 'Bu gün bir işini maşın əvəzinə velosiped/skuter ilə gör, şəkil çək.',    icon: '🚲', requiresPhoto: true,  category: 'transport', xal: 70,  coin: 7  },
  { id: 't12', title: 'Şüşə / plastik ayır',      description: 'Şüşə və ya plastik atığı ayrıca quta at, şəkil çək.',                    icon: '♻️', requiresPhoto: true,  category: 'waste',     xal: 45,  coin: 5  },
  { id: 't13', title: 'Bağçada vaxt keçir',       description: 'Park, bağ və ya meşədə ən azı 20 dəq. keçir, şəkil çək.',                icon: '🌿', requiresPhoto: true,  category: 'nature',    xal: 50,  coin: 5  },
  { id: 't14', title: 'Qaz sızmasını yoxla',      description: 'Mətbəxdə ocaq söndürülüb yoxlanıldı? ✓ işarəsi qoy.',                   icon: '🔥', requiresPhoto: false, category: 'energy',    xal: 10,  coin: 1  },
  { id: 't15', title: 'Bitki əkin',               description: 'Bir toxum əkib və ya kök cücərdin, şəkilini çəkib yüklə.',               icon: '🌻', requiresPhoto: true,  category: 'nature',    xal: 100, coin: 10 },
];

export function getDailyTasks(dateStr: string, userId = 0): TaskTemplate[] {
  const dateSeed = dateStr.split('-').reduce((acc, v) => acc + parseInt(v), 0);
  const seed = dateSeed ^ (userId * 2654435761);
  const shuffled = [...ALL_TASKS].sort((a, b) => hashCode(a.id + seed) - hashCode(b.id + seed));
  return shuffled.slice(0, 5);
}

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return h;
}
