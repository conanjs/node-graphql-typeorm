import { DataSource } from "typeorm";
// yarn typeorm migration:generate -- -d ./ormconfig.ts migrations
export const connectionSource = new DataSource({
    migrationsTableName: "migrations",
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "12345",
    database: "next-graph-typeorm-migrations",
    logging: false,
    synchronize: false,
    // name: 'default',
    entities: ["src/@Database/PostgreSQL/entities/*.ts"],
    migrations: ["src/migrations/*.ts"],
    // subscribers: ["src/subscriber/**/*{.ts,.js}"],
});
// connectionSource.initialize();
