import { DataSource } from 'typeorm';
import { entities } from './entities';

const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'db.sqlite',
  entities,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});

export default AppDataSource;
