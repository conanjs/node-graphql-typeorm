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
    type: "postgres" as "postgres",
    host: "postgresql-99441-0.cloudclusters.net",
    port: 10092 as any,
    username: "admin",
    password: "12345678",
    database: "next-graph-typeorm-migrations",
    // ...(isProduction
    //     ? {
    //           extra: {
    //               ssl: {
    //                   rejectUnauthorized: true,
    //               },
    //           },
    //       }
    //     : {}),
    synchronize: isProduction ? false : true,
    logging: true,
    entities: [User, Post, Vote, Customer, Photo],
    migrations: [path.join(__dirname, "/migrations/*")],
    subscribers: [],
});

// if (isProduction) AppDataSource.runMigrations();
