const type = 'postgres';
const username = 'adminpg'; 
const password = 'D6w9yRIWw7r92opvkVzp';
const host = 'variamos-db.postgres.database.azure.com';
const port = 5432;
const database = 'bugTracker'; //name of database

module.exports = {
  type,
  url:
    `${type}://${username}:${password}@${host}:${port}/${database}`,
  entities: [
    process.env.NODE_ENV === 'test'
      ? 'src/entity/**/*.ts'
      : 'build/entity/**/*.js',
  ],
  migrations: [
    process.env.NODE_ENV === 'test'
      ? 'src/migration/**/*.ts'
      : 'build/migration/**/*.js',
  ],
  cli: {
    entitiesDir:
      process.env.NODE_ENV === 'test' ? 'src/entity' : 'build/entity',
    migrationsDir:
      process.env.NODE_ENV === 'test' ? 'src/migration' : 'build/migration',
  },
  synchronize: false,
  logging: false,
  // Necessary to connect to remote database
  extra: {
    ssl: true,
  },
};
