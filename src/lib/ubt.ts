export function getUbtDate(customDate?: string): Date {
  if (customDate) return new Date(customDate);
  // Ресми негізгі ҰБТ: 10 мамыр — 10 шілде. Әдепкі: 10 мамыр
  const now = new Date();
  const thisYearUbt = new Date(now.getFullYear(), 4, 10); // May 10
  if (thisYearUbt.getTime() < now.getTime()) {
    return new Date(now.getFullYear() + 1, 4, 10);
  }
  return thisYearUbt;
}

export function daysUntilUbt(customDate?: string): number {
  const diff = getUbtDate(customDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function lastNDates(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getLevelByPoints(points: number): 'Іздеуші' | 'Білгір' | 'Шебер' {
  if (points >= 5000) return 'Шебер';
  if (points >= 2000) return 'Білгір';
  return 'Іздеуші';
}

/**
 * Грант мүмкіндігін есептейді.
 * @param score  — ағымдағы балл (0-140)
 * @param threshold — мамандық бойынша ең төменгі грант балы
 */
export function getGrantChance(score: number, threshold: number): number {
  if (threshold === 0) return 0;
  return Math.min(100, Math.round((score / threshold) * 100));
}

export interface Motivation {
  text: string;
  emoji: string;
  author: string;
}

const MOTIVATIONS: Motivation[] = [
  // === Harvard University ===
  { text: 'Бүгін ұйықтасаң — арман көресің. Бүгін оқысаң — арманыңды жүзеге асырасың', emoji: '🏛️', author: 'Harvard University' },
  { text: 'Оқу қиындығы уақытша, ал оқымағандық қиындығы — мәңгілік', emoji: '📚', author: 'Harvard University' },
  { text: 'Сенің орнында оқып отырған адам бар. Оны озып кет', emoji: '🔥', author: 'Harvard University' },
  { text: 'Көп ұйықтаған адам — көп арман көреді, бірақ ешқашан жүзеге асырмайды', emoji: '⏰', author: 'Harvard University' },
  { text: 'Бүгінгі тер — ертеңгі жеңіс', emoji: '💧', author: 'Harvard University' },
  { text: 'Инвестицияның ең жақсысы — өз білімің', emoji: '📈', author: 'Harvard University' },

  // === Stanford University ===
  { text: 'Сәтсіздік — бұл соңы емес, ол жаңа бастаманың бір бөлігі', emoji: '🚀', author: 'Stanford University' },
  { text: 'Әлемді өзгертетін адамдар — ешқашан дайындалуды тоқтатпайды', emoji: '🌍', author: 'Stanford University' },
  { text: 'Ең жақсы уақыт — кеше болатын. Келесі жақсы уақыт — қазір', emoji: '⚡', author: 'Stanford University' },
  { text: 'Жайлылық аймағынан шық — даму сонда басталады', emoji: '🧗', author: 'Stanford University' },

  // === MIT ===
  { text: 'Қиын мәселелерді шешетін адамдар — әлемді басқарады', emoji: '🧠', author: 'MIT' },
  { text: 'Білім — жалғыз қару, оны ешкім тартып ала алмайды', emoji: '🛡️', author: 'MIT' },
  { text: 'Шектеулер — тек сенің ойыңда. Нақты шек жоқ', emoji: '♾️', author: 'MIT' },

  // === Oxford University ===
  { text: 'Тәртіп — таланттан да күшті. Күнделікті жаса', emoji: '🎯', author: 'Oxford University' },
  { text: 'Білім берудің тамыры ащы, бірақ жемісі тәтті', emoji: '🌳', author: 'Oxford University' },

  // === Cambridge University ===
  { text: 'Ұлы нәтижелер — кішкентай күнделікті қадамдардан жасалады', emoji: '👣', author: 'Cambridge University' },
  { text: 'Сен не оқып отырсың — сол боласың', emoji: '📖', author: 'Cambridge University' },

  // === Yale University ===
  { text: 'Жеңіске жетудің құпиясы — бастау. Тек баста', emoji: '🏁', author: 'Yale University' },
  { text: 'Ешкім саған сенбесе де — өзіңе сен', emoji: '💪', author: 'Yale University' },

  // === Princeton University ===
  { text: 'Ақылды адам — мәселені шешеді, данышпан адам — мәселеге жол бермейді', emoji: '🔍', author: 'Princeton University' },

  // === Columbia University ===
  { text: 'Білім — бостандық. Оқы да еркін бол', emoji: '🗽', author: 'Columbia University' },

  // === Назарбаев Университеті ===
  { text: 'Қазақстанның болашағы — білімді жастардың қолында', emoji: '🇰🇿', author: 'Назарбаев Университеті' },
  { text: 'Мақсатыңды биік қой — ҰБТ тек бастама, шың алда', emoji: '🏔️', author: 'Назарбаев Университеті' },

  // === ҰБТ-ға итермелейтін ===
  { text: 'Гарвардқа түскен студент де саған ұқсап, кешке дейін дайындалған', emoji: '🏛️', author: '' },
  { text: 'ҰБТ — тек бір сынақ. Стэнфордтың студенттері де сынақтан өткен', emoji: '🎓', author: '' },
  { text: 'MIT студенттері де бірінші күні қиналған. Қиналу — өсу белгісі', emoji: '🌱', author: '' },
  { text: 'Сен 140 баллға лайықсың. Тоқтама — нәтиже жақын!', emoji: '🏆', author: '' },
  { text: 'Грантты алатын адам — дәл қазір дайындалып отырған адам', emoji: '🎯', author: '' },
  { text: 'Күнде 1 тест — ай соңында 30 тест. Oxford студенттері де осылай бастаған', emoji: '📊', author: '' },
  { text: 'Қиналып отырсың ба? Демек дұрыс жолдасың — Harvard та солай дейді', emoji: '💎', author: '' },
  { text: 'Ертеңгі грант иегері — бүгінгі еңбекшіл оқушы', emoji: '🌅', author: '' },
  { text: 'Әлемнің ең мықты университеттерінде оқитын адамдар — бүгін тоқтамаған адамдар', emoji: '🌟', author: '' },
  { text: 'Cambridge профессоры: «Табысты студент — талантты емес, тәртіпті студент»', emoji: '📏', author: '' },
  { text: 'Бүгін оқы — ертең Назарбаев Университетінде отыр', emoji: '🇰🇿', author: '' },
  { text: 'Princeton-да оқу қиын емес, ол жерге дейін жету қиын. Бүгін сол жолдасың', emoji: '🛤️', author: '' },

  // === Қазақ мақал-мәтелдері ===
  { text: 'Оқу — озу, оқымау — тозу', emoji: '📖', author: 'Қазақ мақалы' },
  { text: 'Талаптыға нұр жауар', emoji: '✨', author: 'Қазақ мақалы' },
  { text: 'Біліміңді жасыңда ал — жасың өткен соң ала алмайсың', emoji: '⏳', author: 'Қазақ мақалы' },
  { text: 'Еңбек етсең ерінбей — тояды қарның тіленбей', emoji: '🌾', author: 'Қазақ мақалы' },

  // === Абай Құнанбайұлы ===
  { text: 'Адамның құны — білімінде, ақылында', emoji: '🧠', author: 'Абай Құнанбайұлы' },
  { text: 'Ақыл мен білім — адамның ең бай қазынасы', emoji: '💎', author: 'Абай Құнанбайұлы' },
];

export function dailyMotivation(): Motivation {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return MOTIVATIONS[dayOfYear % MOTIVATIONS.length];
}
