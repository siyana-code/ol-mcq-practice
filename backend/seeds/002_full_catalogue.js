/**
 * Full Sri Lankan O/L subject catalogue.
 *
 * Structure: 6 mandatory + 3 optional baskets (one pick each).
 * is_mcq = false  ->  no drillable MCQ Paper I (practical or essay based).
 *
 * Mathematics is retained but flagged is_mcq=false per product decision.
 */
const MANDATORY = [
  { name_si: 'සිංහල භාෂාව', name_en: 'Sinhala Language', icon: 'text', sort_order: 1, is_mcq: true },
  { name_si: 'ඉංග්‍රීසි භාෂාව', name_en: 'English Language', icon: 'language', sort_order: 2, is_mcq: true },
  { name_si: 'විද්‍යාව', name_en: 'Science', icon: 'flask', sort_order: 3, is_mcq: true },
  { name_si: 'ඉතිහාසය', name_en: 'History', icon: 'time', sort_order: 4, is_mcq: true },
  { name_si: 'ධර්මය', name_en: 'Religion', icon: 'flower', sort_order: 5, is_mcq: true },
  { name_si: 'ගණිතය', name_en: 'Mathematics', icon: 'calculator', sort_order: 6, is_mcq: false },
];

const BASKET1 = [
  { name_si: 'ව්‍යාපෘති හා ගණකිරිම් අධ්‍යාපනය', name_en: 'Business & Accounting Studies', icon: 'briefcase', sort_order: 1, is_mcq: true },
  { name_si: 'ජීමවාසය', name_en: 'Geography', icon: 'earth', sort_order: 2, is_mcq: true },
  { name_si: 'සමාජ අධ්‍යාපනය', name_en: 'Civic Education', icon: 'people', sort_order: 3, is_mcq: true },
  { name_si: 'නවෝප්තුකාරිත්වය', name_en: 'Entrepreneurship Studies', icon: 'rocket', sort_order: 4, is_mcq: true },
  { name_si: 'දෙවන භාෂාව — සිංහල', name_en: 'Second Language — Sinhala', icon: 'language', sort_order: 5, is_mcq: true },
  { name_si: 'දෙවන භාෂාව — දෙමළය', name_en: 'Second Language — Tamil', icon: 'language', sort_order: 6, is_mcq: true },
  { name_si: 'පාලි භාෂාව', name_en: 'Pali', icon: 'language', sort_order: 7, is_mcq: true },
  { name_si: 'සංස්කෘත භාෂාව', name_en: 'Sanskrit', icon: 'language', sort_order: 8, is_mcq: true },
  { name_si: 'ප්‍රංඡික භාෂාව', name_en: 'French', icon: 'language', sort_order: 9, is_mcq: true },
  { name_si: 'ජර්මාන භාෂාව', name_en: 'German', icon: 'language', sort_order: 10, is_mcq: true },
  { name_si: 'හින්දි භාෂාව', name_en: 'Hindi', icon: 'language', sort_order: 11, is_mcq: true },
  { name_si: 'ජපානි භාෂාව', name_en: 'Japanese', icon: 'language', sort_order: 12, is_mcq: true },
  { name_si: 'අරාබි භාෂාව', name_en: 'Arabic', icon: 'language', sort_order: 13, is_mcq: true },
];

// Basket 2 is practical / performance assessed, so nothing here is MCQ.
const BASKET2 = [
  { name_si: 'නැගුගා සංගීතය', name_en: 'Eastern Music', icon: 'musical-notes', sort_order: 1, is_mcq: false },
  { name_si: 'පාර්ථගාතීය සංගීතය', name_en: 'Western Music', icon: 'musical-notes', sort_order: 2, is_mcq: false },
  { name_si: 'කර්නාටක සංගීතය', name_en: 'Carnatic Music', icon: 'musical-notes', sort_order: 3, is_mcq: false },
  { name_si: 'නැගුගා නර්තනය', name_en: 'Eastern Dancing', icon: 'body', sort_order: 4, is_mcq: false },
  { name_si: 'භාරත නර්තනය', name_en: 'Bharatha Dancing', icon: 'body', sort_order: 5, is_mcq: false },
  { name_si: 'චිත්‍ර ශිල්පය', name_en: 'Art', icon: 'color-palette', sort_order: 6, is_mcq: false },
  { name_si: 'නාට්‍ය හා රංගනය', name_en: 'Drama and Theatre', icon: 'film', sort_order: 7, is_mcq: false },
  { name_si: 'ඉංග්‍රීසි ගදන අධ්‍යාපනය', name_en: 'Appreciation of English Literary Texts', icon: 'book', sort_order: 8, is_mcq: false },
  { name_si: 'සිංහල ගදන අධ්‍යාපනය', name_en: 'Appreciation of Sinhala Literary Texts', icon: 'book', sort_order: 9, is_mcq: false },
  { name_si: 'දෙමළ ගදන අධ්‍යාපනය', name_en: 'Appreciation of Tamil Literary Texts', icon: 'book', sort_order: 10, is_mcq: false },
  { name_si: 'අරාබි ගදන අධ්‍යාපනය', name_en: 'Appreciation of Arabic Literary Texts', icon: 'book', sort_order: 11, is_mcq: false },
];

const BASKET3 = [
  { name_si: 'තොරතුරු තත්තු ක්‍රමය', name_en: 'Information & Communication Technology', icon: 'desktop', sort_order: 1, is_mcq: true },
  { name_si: 'ගොවිත්‍රීම හා ආහාර තත්තුක්‍රමය', name_en: 'Agriculture & Food Technology', icon: 'leaf', sort_order: 2, is_mcq: true },
  { name_si: 'ජලජ වයර තත්තුක්‍රමය', name_en: 'Aquatic Bio Resources Technology', icon: 'fish', sort_order: 3, is_mcq: true },
  { name_si: 'කලාව හා අත්කරණය', name_en: 'Arts & Crafts', icon: 'hammer', sort_order: 4, is_mcq: true },
  { name_si: 'ගෘහ අධ්‍යාපනය', name_en: 'Home Economics', icon: 'home', sort_order: 5, is_mcq: true },
  { name_si: 'සෞඛ්‍ය හා චාලකාලික අධ්‍යාපනය', name_en: 'Health & Physical Education', icon: 'fitness', sort_order: 6, is_mcq: true },
  { name_si: 'සන්දේශ හා මාධ්‍ය අධ්‍යාපනය', name_en: 'Communication & Media Studies', icon: 'videocam', sort_order: 7, is_mcq: true },
  { name_si: 'සැකසුම් හා ගොඩනැගිලි තත්තුක්‍රමය', name_en: 'Design & Construction Technology', icon: 'construct', sort_order: 8, is_mcq: true },
  { name_si: 'සැකසුම් හා යාබ්‍ය තත්තුක්‍රමය', name_en: 'Design & Mechanical Technology', icon: 'build', sort_order: 9, is_mcq: true },
  { name_si: 'සැකසුම්, ඉලෙක්ට්‍රෝනික හා ඉලෙක්ට්‍රනික තත්තුක්‍රමය', name_en: 'Design, Electrical & Electronic Technology', icon: 'flash', sort_order: 10, is_mcq: true },
  { name_si: 'ඉලෙක්ට්‍රෝනික ලේඛන හා අනුර්ත ලියුපිය', name_en: 'Electronic Writing & Shorthand', icon: 'keypad', sort_order: 11, is_mcq: true },
];

const catalogue = [
  ...MANDATORY.map((s) => ({ ...s, category: 'mandatory' })),
  ...BASKET1.map((s) => ({ ...s, category: 'basket1' })),
  ...BASKET2.map((s) => ({ ...s, category: 'basket2' })),
  ...BASKET3.map((s) => ({ ...s, category: 'basket3' })),
];

/** Starter topics for the MCQ subjects we plan to populate first. */
const TOPICS = [
  ['Science', 'රසායන විද්‍යාව', 'Chemistry', 1],
  ['Science', 'භෞතික විද්‍යාව', 'Physics', 2],
  ['Science', 'ජීව විද්‍යාව', 'Biology', 3],
  ['English Language', 'ව්‍යාකරණය', 'Grammar', 1],
  ['English Language', 'වචන මාලාව', 'Vocabulary', 2],
  ['English Language', 'පාර්සය', 'Comprehension', 3],
  ['History', 'පෙර ඉතිහාසය', 'Ancient History', 1],
  ['History', 'මධ්‍ය ඉතිහාසය', 'Medieval History', 2],
  ['History', 'නවීන ඉතිහාසය', 'Modern History', 3],
  ['Sinhala Language', 'ව්‍යාකරණය', 'Grammar', 1],
  ['Sinhala Language', 'වචන මාලාව', 'Vocabulary', 2],
  ['Religion', 'බුද්ධ ධර්මය', 'Buddhism', 1],
  ['Religion', 'සිල්ල ධර්මය', 'Hinduism', 2],
  ['Religion', 'ක්‍රිස්තු ධර්මය', 'Christianity', 3],
  ['Religion', 'ඉස්ලාම් ධර්මය', 'Islam', 4],
  ['Information & Communication Technology', 'පරිපථ සහගත', 'Networks', 1],
  ['Information & Communication Technology', 'දත්ත ගබඩා', 'Databases', 2],
  ['Information & Communication Technology', 'වැඩසැලි', 'Web', 3],
  ['Business & Accounting Studies', 'ගණකිරිම', 'Accounting', 1],
  ['Business & Accounting Studies', 'ව්‍යාපාරය', 'Business', 2],
  ['Geography', 'භූමික විද්‍යාව', 'Physical Geography', 1],
  ['Geography', 'මිනිම ජීමවාසය', 'Human Geography', 2],
].map(([subjectName, nameSi, nameEn, sortOrder]) => ({
  subjectName,
  name_si: nameSi,
  name_en: nameEn,
  sort_order: sortOrder,
}));

exports.seed = async function (knex) {
  // Clear content tables. Users are preserved — this is a content seed.
  await knex('user_subjects').del();
  await knex('user_progress').del();
  await knex('questions').del();
  await knex('topics').del();
  await knex('past_papers').del();
  await knex('subjects').del();

  await knex('subjects').insert(catalogue);

  // Topics only for subjects we intend to fill with MCQs.
  const mcqSubjects = await knex('subjects').where({ is_mcq: true });
  const idByName = new Map(mcqSubjects.map((s) => [s.name_en, s.id]));

  const rows = TOPICS.filter((t) => idByName.has(t.subjectName)).map((t) => ({
    subject_id: idByName.get(t.subjectName),
    name_si: t.name_si,
    name_en: t.name_en,
    sort_order: t.sort_order,
  }));

  if (rows.length) await knex('topics').insert(rows);
};