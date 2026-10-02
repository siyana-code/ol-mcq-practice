exports.up = function (knex) {
  return knex.schema.createTable('subjects', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name_si').notNullable();
    table.string('name_en').notNullable();
    table.string('icon');
    table.integer('sort_order').defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('subjects');
};
