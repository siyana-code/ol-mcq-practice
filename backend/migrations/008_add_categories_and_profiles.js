exports.up = function (knex) {
  return knex.schema
    .alterTable('subjects', (table) => {
      table.text('category').notNullable().defaultTo('mandatory');
      table.boolean('is_mcq').notNullable().defaultTo(true);
    })
    .then(() =>
      knex.raw(`
        ALTER TABLE subjects
        ADD CONSTRAINT subjects_category_check
        CHECK (category IN ('mandatory','basket1','basket2','basket3'))
      `)
    )
    .then(() =>
      knex.schema.alterTable('users', (table) => {
        table.text('mother_language');
        table.text('religion');
        table.timestamp('onboarded_at');
      })
    )
    .then(() =>
      knex.raw(`
        ALTER TABLE users
        ADD CONSTRAINT users_mother_language_check
        CHECK (mother_language IN ('sinhala','tamil'))
      `)
    )
    .then(() =>
      knex.raw(`
        ALTER TABLE users
        ADD CONSTRAINT users_religion_check
        CHECK (religion IN ('buddhism','christianity','islam','shaivism'))
      `)
    )
    .then(() =>
      knex.schema.createTable('user_subjects', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.uuid('subject_id').notNullable().references('id').inTable('subjects').onDelete('CASCADE');
        table.integer('basket').notNullable();
        table.timestamps(true, true);
        table.unique(['user_id', 'subject_id']);
      })
    )
    .then(() =>
      knex.raw(`
        ALTER TABLE user_subjects
        ADD CONSTRAINT user_subjects_basket_check
        CHECK (basket IN (1,2,3))
      `)
    )
    .then(() =>
      knex.raw(
        'CREATE UNIQUE INDEX idx_user_subjects_one_per_basket ON user_subjects (user_id, basket)'
      )
    );
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('user_subjects')
    .then(() =>
      knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_religion_check')
    )
    .then(() =>
      knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_mother_language_check')
    )
    .then(() =>
      knex.schema.alterTable('users', (table) => {
        table.dropColumn('mother_language');
        table.dropColumn('religion');
        table.dropColumn('onboarded_at');
      })
    )
    .then(() =>
      knex.raw('ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_category_check')
    )
    .then(() =>
      knex.schema.alterTable('subjects', (table) => {
        table.dropColumn('category');
        table.dropColumn('is_mcq');
      })
    );
};