exports.seed = function (knex) {
  return knex('subjects').del()
    .then(() => knex('subjects').insert([
      { id: '11111111-1111-1111-1111-111111111111', name_si: 'ගණිතය', name_en: 'Mathematics', icon: 'calculator', sort_order: 1 },
      { id: '22222222-2222-2222-2222-222222222222', name_si: 'විද්‍යාව', name_en: 'Science', icon: 'flask', sort_order: 2 },
      { id: '33333333-3333-3333-3333-333333333333', name_si: 'ඉංග්‍රීසි', name_en: 'English', icon: 'book', sort_order: 3 },
    ]))
    .then(() => knex('topics').insert([
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', subject_id: '11111111-1111-1111-1111-111111111111', name_si: 'බිදුම්', name_en: 'Fractions', sort_order: 1 },
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', subject_id: '11111111-1111-1111-1111-111111111111', name_si: 'සංඛ්‍යා', name_en: 'Numbers', sort_order: 2 },
      { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', subject_id: '22222222-2222-2222-2222-222222222222', name_si: 'රසායන විද්‍යාව', name_en: 'Chemistry', sort_order: 1 },
      { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', subject_id: '22222222-2222-2222-2222-222222222222', name_si: 'භෞතික විද්‍යාව', name_en: 'Physics', sort_order: 2 },
    ]));
};
