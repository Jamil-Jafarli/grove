export interface EcoFact {
  text: string;
  detail: string;
  icon: string;
  category: string;
}

export const ecoFacts: EcoFact[] = [
  {
    icon: '🌊', category: 'Plastik',
    text: 'Dünya okeanları hər il 8 milyon ton plastik qəbul edir — hər dəqiqə bir yük maşını.',
    detail: 'Plastik tullantıların 80%-i qurudan gəlir. Bu plastiklər mikroplastiklərə parçalanır (5 mm-dən kiçik) və balıqların qanına qarışır. Artıq insan qanında da mikroplastik aşkar edilib. Həll: tək istifadəlik plastikdən imtina, geri emal.',
  },
  {
    icon: '🌳', category: 'İqlim',
    text: 'Bir ağac ildə 22 kq CO₂ udur. 100 ağac bir avtomobilin illik emissiyasını neytrallaşdırır.',
    detail: 'Ağaclar fotosintez zamanı CO₂ alıb O₂ buraxır. Tropik meşələr Yer atmosferinin "ağciyəri" sayılır. Amazon meşəsi dünya oksigeninin 20%-ni istehsal edir. Lakin son 50 ildə Amazon-un 17%-i məhv edilib.',
  },
  {
    icon: '🇦🇿', category: 'Azərbaycan',
    text: 'Azərbaycanda 9 iqlim qurşağından 8-i mövcuddur — bu nadir ekoloji müxtəlifliyə malikdir.',
    detail: 'Azərbaycan coğrafi mövqeyinə görə subtropikdən alp çölünə qədər olan iqlim qurşaqlarını əhatə edir. Lənkəran subtropik, Abşeron yarımsəhra, Böyük Qafqaz alp iqlimindədir. Bu müxtəliflik 9000+ bitki növünə ev sahibliyi edir.',
  },
  {
    icon: '♻️', category: 'Plastik',
    text: 'Bir plastik şüşənin tam parçalanması 450 il çəkir.',
    detail: 'PET (polietilen tereftalat) şüşələr ən geniş yayılmış plastik növüdür. Təbiətdə fotooksidləşmə ilə kiçilir, lakin tam parçalanmır — mikroplastiklərə çevrilir. 1950-ci ildən üretilən plastiklərin 91%-i heç vaxt geri emal olunmayıb.',
  },
  {
    icon: '🌿', category: 'Azərbaycan',
    text: 'Hirkan meşələri 25 milyon illik tarixi olan unikal ekosistemdir.',
    detail: 'Lənkəran-Astara rayonlarında yerləşən Hirkan meşələri Buzlaşma dövründən sağ qalan relikt ekosistemdir. Şümşad, dəmirağac, Lənkəran akasiyası burada yetişir. 2021-ci ildə UNESCO Dünya İrsi siyahısına daxil edilib.',
  },
  {
    icon: '🐝', category: 'Biomüxtəliflik',
    text: 'Arılar bitki növlərinin 70%-ni tozlandırır. Arısız qlobal qida böhranı qaçılmaz olardı.',
    detail: 'Dünya ərzaq istehsalının 1/3-i birbaşa tozlandırıcılara bağlıdır. Pestisidlər, iqlim dəyişikliyi və yaşayış məkanlarının itirilməsi ilə arı koloniyaları son 50 ildə 50% azalıb. Azərbaycanda 300+ arı növü qeydiyyatdadır.',
  },
  {
    icon: '🧊', category: 'İqlim',
    text: 'Arktika buzunun son 50 ildə 75%-i əriyib. Dəniz səviyyəsi 3.3 mm/il qalxır.',
    detail: 'Qlobalısınma sürəti Arktikada digər bölgələrdən 4 dəfə yüksəkdir (Arktika amplifikasiyası). Qrenlandi buz örtüyü tamamilə ərisə dünya okean səviyyəsi 7 m yüksələr. Bu, Bakı daxil onlarla sahil şəhərinin su altında qalması deməkdir.',
  },
  {
    icon: '🏞️', category: 'Azərbaycan',
    text: 'Kür çayı (1515 km) Cənubi Qafqazın ən uzun çayıdır, lakin sənaye çirklənməsi ciddi təhlükə yaradır.',
    detail: 'Kür Türkiyədən başlayaraq Gürcüstan və Azərbaycandan keçib Xəzərə tökülür. Boyunca 5 milyon insan içməli su olaraq Kür suyundan istifadə edir. Sənaye tullantıları, mineral gübrələr və neft məhsulları çayın ekologiyasını ciddi korlamışdır.',
  },
  {
    icon: '📄', category: 'Meşə',
    text: 'Bir ton kağız üçün 17 ağac kəsilir, 26.000 L su işlədilir.',
    detail: 'Dünyada ildə 420 milyon hektar meşə kəsilir. Meşəsizləşmə qlobal emissiyaların 10%-ni təşkil edir. Rəqəmsal alternativlər (e-poçt, elektron sənəd) bir ilin içində hər ofis işçisi üçün 10-17 ağacı xilas edə bilər.',
  },
  {
    icon: '💧', category: 'Su',
    text: 'Dünyanın şirin su ehtiyatının 70%-i kənd təsərrüfatı suvarmalarına sərf olunur.',
    detail: 'Yer üzündə mövcud suyun yalnız 2.5%-i şirindir, onun 68.9%-i buzlaqlardadır. Əlçatan şirin su cəmi 0.3%-dir. Azərbaycanda su istehlakı dünya ortalamasının 3 qatıdır. Damcılatma üsulu ilə suvarma su istehlakını 50% azaldır.',
  },
  {
    icon: '🦋', category: 'Biomüxtəliflik',
    text: 'İnsan fəaliyyəti nəticəsində hər gün ~150 növ məhv olur — bu tarixi normanın 1000 qatıdır.',
    detail: '6. kütləvi yox olma hadisəsi yaşanır. Son 40 ildə onurğalı heyvan populyasiyası 60% azalıb. Azərbaycanda 106 nadir və nəsli kəsilmək üzrə olan heyvan növü Qırmızı Kitaba daxil edilib. Cangüdən məkanlar, ekoloji dəhlizlər həll yollarından biridir.',
  },
  {
    icon: '💡', category: 'Enerji',
    text: 'LED lampalar adi lambalardan 75% az enerji işlədir, 25 dəfə daha uzun xidmət edir.',
    detail: 'Azərbaycanda elektrik enerjisinin 90%-i fosil yanacaqlardan alınır. Bir ev bütün lambalarını LED-ə keçirsə, ildə 100-200 AZN qənaət edir. Avropada 2025-dən ənənəvi lampaların satışı tamamilə qadağan edilib.',
  },
  {
    icon: '🏔️', category: 'Azərbaycan',
    text: 'Qobustan Milli Parkı UNESCO Dünya İrsi siyahısındadır — 6000 il əvvəlki insan-təbiət əlaqəsini əks etdirir.',
    detail: 'Qobustanda 6000-dən çox qaya oyması (petroglyf) var. Bu rəsmlər ovçuluq, rəqs, gəmi sürücülüğü kimi keçmiş insanların ekosistemi ilə münasibətini göstərir. Eyni zamanda palçıq vulkanları (dünya palçıq vulkanlarının 1/3-i Azərbaycandadır) bu parkdadır.',
  },
  {
    icon: '🚴', category: 'Nəqliyyat',
    text: 'Avtomobil əvəzinə velosipeddən istifadə ildə 1.5 ton CO₂ emissiyasını azaldır.',
    detail: 'Şəhər içi yolculuqların 50%-i 5 km-dən azdır — bu məsafə üçün velosiped çox vaxt avtomobil qədər sürətlidir. Bakıda velosiped yollarının genişləndirilməsi şəhər havasının keyfiyyətini əhəmiyyətli dərəcədə yaxşılaşdıra bilər. Hollandiyada ildə 18 milyard km velosiped yolu qət edilir.',
  },
  {
    icon: '🐠', category: 'Okean',
    text: 'Okeanların 30%-i artıq turşulaşıb — dəniz orqanizmlərinin skeletlərini məhv edir.',
    detail: 'CO₂-nin 30%-ni okeanlar udum edir. Bu proses dəniz suyunu turşuya çevirir (pH 8.2→8.1 — 26% turşuluq artımı). Mərcanlar, istiridyə, plankton bu dəyişiklikdən ən çox zərər çəkir. Mərcan resifləri məhv olsa, 500 milyon insan ərzaq və gəlir itirir.',
  },
  {
    icon: '🐆', category: 'Azərbaycan',
    text: 'Azərbaycanda Qafqaz leopardı yaşayır — dünyada ən az öyrənilmiş böyük pişik növlərindən biri.',
    detail: 'Qafqaz leopardı (Panthera pardus ciscaucasica) Azərbaycanda Hirkan milli parkı, Zəngəzur Milli Parkı ərazilərində yaşayır. Kamera tələləri 2020-2024-cü illərdə bir neçə fərd qeydə almışdır. Ovçuluq, yaşayış mühitinin parçalanması əsas təhlükədir.',
  },
  {
    icon: '🍔', category: 'Su',
    text: 'Bir hamburger istehsal etmək üçün 2400 litr su lazımdır — 80 dəfə duş almaqla bərabərdir.',
    detail: 'Ət istehsalı ən su-intensiv qida növüdür. 1 kq mal əti üçün 15.400 L, 1 kq donuz əti üçün 6.000 L su lazımdır. Müqayisə: 1 kq pomidor üçün cəmi 214 L su istifadə olunur. Həftəlik bir ətli yeməyi bitki əsaslı alternativlə əvəz etsən, 1000+ litr su qənaət edirsin.',
  },
  {
    icon: '☀️', category: 'Enerji',
    text: 'Günəş enerjisi son 10 ildə 89% ucuzlaşıb — artıq ən sərfəli enerji mənbəyidir.',
    detail: 'Azərbaycanda illik günəş şüalanması 2700 saat, bu Avropanın əksər hissəsindən yüksəkdir. Abşeron yarımadasının günəş potensialı gündə 4.5-5 kWh/m²-dir. 2023-cü ildə Qarabağda 240 MVt-lıq günəş elektrik stansiyası istismara verildi.',
  },
  {
    icon: '🌱', category: 'Torpaq',
    text: 'Torpaq üst qatının 1 sm formalaşması 500-1000 il tələb edir, eroziyası isə saatlar içində baş verir.',
    detail: 'Dünyada hər il 24 milyard ton münbit torpaq itirilir — bu, Hindistanın bütün kənd torpaqlarına bərabərdir. Torpaq eroziyasının əsas səbəbləri: meşəsizləşmə, düzgün olmayan becərмə, həddindən artıq otarma. Torpaq qoruması: ağac əkimi, terraslaşdırma, üzvi kənd təsərrüfatı.',
  },
  {
    icon: '🌊', category: 'Azərbaycan',
    text: 'Xəzər dənizi sahəsi 371.000 km² ilə dünyanın ən böyük qapalı su hövzəsidir, lakin su səviyyəsi azalır.',
    detail: 'Xəzər dənizinin səviyyəsi son 30 ildə 3 m azalıb. Əsas səbəblər: iqlim dəyişikliyi (artan buxarlanma), Volqa çayından su götürülməsinin artması. Neftin sızması, sənaye tullantıları da ciddi problemdir. Xəzər suitisi (Pusa caspica) dünyada yalnız burada yaşayır.',
  },
  {
    icon: '🔄', category: 'Geri emal',
    text: '1 ton alüminium geri emalı 14.000 kWh enerji qənaət edir — 10 ildə bir evin enerjisi.',
    detail: 'Alüminium istehsalı elektrik enerjisini çox işlədir. Geri emal ilkinə nisbətən 95% az enerji tələb edir. Azərbaycanda alüminium geri emalı hələ inkişaf mərhələsindədir. Gündəlik içdiyimiz alüminium qutunu gerи etsən, 3 saat TV izləmək enerjisi qənaət olunur.',
  },
  {
    icon: '🐄', category: 'İqlim',
    text: 'Metan CO₂-dən 80 dəfə güclü istilik tutma qabiliyyətinə malikdir; heyvandarlıq əsas mənbədir.',
    detail: 'Qlobal metan emissiyasının 32%-i heyvandarlıqdan gəlir. Hər inək gündə 200-500 L metan buraxır (əsasən geğirmə ilə). Dəniz yosunu (Asparagopsis) yem qarışığına əlavə edilsə, metanı 80% azaldır. Azərbaycanda heyvandarlıq aqrar sektorun 50%-ni təşkil edir.',
  },
  {
    icon: '🌺', category: 'Azərbaycan',
    text: 'Azərbaycanda 9000+ bitki, 700+ onurğalı, 15.000+ onurğasız heyvan növü qeydiyyata alınıb.',
    detail: 'Bu zənginliyin 240 bitki növü Azərbaycana endemikdir — yəni dünyada başqa heç bir yerdə yetişmir. Şahdağ Milli Parkı ən çox endemik növü ehtiva edir. Talış meşələrinin məhv edilməsi bu endemiklərin sonu ola bilər.',
  },
  {
    icon: '👕', category: 'Plastik',
    text: 'Sintetik paltar hər yuyuşda 700.000 mikroplastik lif buraxır — dərhal suya qarışır.',
    detail: 'Geyim sənayesi qlobal karbon emissiyasının 10%-ni, su çirklənməsinin 20%-ni yaradır. Bir pol polartəb paltarda 6 milyon lif var, yuyulduqda 250.000-i su süzgəclərini keçib okeana çatır. Təbii liflər (pambıq, kətan, yun) daha az mikroplastik buraxır.',
  },
  {
    icon: '🌻', category: 'Biomüxtəliflik',
    text: 'Azərbaycanda 19 Milli Park və 24 Dövlət Təbiət Qoruğu mövcuddur — ümumi sahəsi 1.2 milyon ha.',
    detail: '2021-ci ildə bərpa olunmuş Azərbaycan torpaqlarında yeni ekoloji qoruqlar yaradılması planlaşdırılır. Qarabağ bölgəsinin ekoloji bərpası (minalardan təmizlənmə, meşəsalma, nadir növlərin qorunması) prioritet istiqamətdir. Zəngəzur Milli Parkı 2021-ci ildə yaradılıb.',
  },
];

export function getDailyFact(seed?: string): EcoFact {
  const today = seed || new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash * 31 + today.charCodeAt(i)) & 0xfffffff;
  }
  return ecoFacts[hash % ecoFacts.length];
}

export function getRandomFact(exclude?: EcoFact): EcoFact {
  const pool = exclude ? ecoFacts.filter(f => f.text !== exclude.text) : ecoFacts;
  return pool[Math.floor(Math.random() * pool.length)];
}
