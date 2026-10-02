exports.up = function (knex) {
  return knex.schema.createTable('user_progress', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('question_id').notNullable().references('id').inTable('questions').onDelete('CASCADE');
    table.integer('selected_answer').notNullable();
    table.boolean('is_correct').notNullable();
    table.integer('time_taken');
    table.timestamp('answered_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('user_progress');
};
