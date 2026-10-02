exports.up = function (knex) {
  return knex.schema.createTable('past_papers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('subject_id').notNullable().references('id').inTable('subjects').onDelete('CASCADE');
    table.integer('year').notNullable();
    table.integer('paper_number').notNullable().defaultTo(1);
    table.string('title_si');
    table.string('title_en');
    table.string('pdf_url');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('past_papers');
};
