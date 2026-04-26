export interface Prize {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredDays: number;
  color: string;
}

export const PRIZES: Prize[] = [
  {
    id: 'water-bottle',
    title: 'Eko Su Şüşəsi',
    description: 'Yenidən istifadə edilə bilən paslanmaz polad su şüşəsi',
    icon: '🍶',
    requiredDays: 10,
    color: 'from-cyan-400 to-blue-500',
  },
  {
    id: 'eco-bag',
    title: 'Eko Torba',
    description: 'Üzvi pambıqdan hazırlanmış xüsusi eko torba',
    icon: '🛍️',
    requiredDays: 15,
    color: 'from-green-400 to-emerald-500',
  },
  {
    id: 'tree-planting',
    title: 'Ağac Əkini',
    description: 'Sənin adına bir ağac əkiləcək!',
    icon: '🌳',
    requiredDays: 20,
    color: 'from-lime-400 to-green-600',
  },
  {
    id: 'powerbank',
    title: 'Solar Powerbank',
    description: 'Günəş enerjisi ilə işləyən portativ batareya',
    icon: '🔋',
    requiredDays: 25,
    color: 'from-yellow-400 to-orange-500',
  },
  {
    id: 'hoodie',
    title: 'Eko Hoodie',
    description: 'Tamamilə üzvi parçadan hazırlanmış xüsusi Grove hoodisi',
    icon: '👕',
    requiredDays: 30,
    color: 'from-violet-400 to-purple-600',
  },
];
