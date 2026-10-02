exports.up = function (knex) {
  return knex.schema.createTable('topics', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('subject_id').notNullable().references('id').inTable('subjects').onDelete('CASCADE');
    table.string('name_si').notNullable();
    table.string('name_en').notNullable();
    table.integer('sort_order').defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('topics');
};
