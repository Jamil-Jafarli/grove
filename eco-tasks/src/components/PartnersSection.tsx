const PARTNERS = [
  { name: 'ASAN Xidmət',                          emoji: '🏛️' },
  { name: 'Ekologiya və Təbii Sərvətlər Nazirliyi', emoji: '🌿' },
  { name: 'Paşa Holding',                          emoji: '🏢' },
  { name: 'Bravo',                                 emoji: '🛒' },
  { name: 'İDEA',                                  emoji: '💡' },
  { name: 'Ekoloji Ekspertiza Agentliyi',          emoji: '🔬' },
];

export default function PartnersSection() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <h3 className="font-bold text-gray-700 text-sm mb-3">🤝 Partnyorlarımız</h3>
      <div className="grid grid-cols-2 gap-2">
        {PARTNERS.map(p => (
          <div
            key={p.name}
            className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"
          >
            <span className="text-xl flex-shrink-0">{p.emoji}</span>
            <span className="text-xs font-medium text-gray-700 leading-tight">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
