// import env from "../../@Config";
import path from "path";
import { DataSource } from "typeorm";
import env, { isProduction } from "../../../@Config/index";
import { Customer } from "../entities/Customer";
import { Photo } from "../entities/Photo";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { Vote } from "../entities/Vote";

export const AppDataSource = new DataSource({
    type: env.DB_TYPE as "postgres",
    host: env.DB_HOST,
    port: env.DB_PORT as any,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DBNAME,
    ...(isProduction
        ? {
              extra: {
                  ssl: {
                      rejectUnauthorized: true,
                  },
              },
          }
        : {}),
    synchronize: isProduction ? false : true,
    logging: true,
    entities: [User, Post, Vote, Customer, Photo],
    migrations: [path.join(__dirname, "/migrations/*")],
    subscribers: [],
});

if (isProduction) AppDataSource.runMigrations();
