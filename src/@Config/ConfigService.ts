import MongoStore from "connect-mongo";
import cors from "cors";
import { Application } from "express";
import session from "express-session";
import ENV, { isProduction } from "./env";
import { MONGO_DB_URL } from "../@Database/MongoDB/index";

export class ConfigService {
    constructor(private readonly app: Application) {}

    useCors() {
        this.app.use(
            cors({
                origin: [
                          "http://localhost:3000",
                          "https://studio.apollographql.com",
                          "http://localhost:3002",
                      ],
                methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
                credentials: true,
            })
        );
    }

    trustProxy() {
        this.app.set("trust proxy", 1);
    }

    useSessionStore() {
        this.app.use(
            session({
                name: ENV.COOKIES_NAME,
                secret: ENV.SECRET_COOKIES,
                // don't save empty session, right from the start
                saveUninitialized: false,
                resave: false,
                store: MongoStore.create({
                    mongoUrl: MONGO_DB_URL,
                }),
                cookie: {
                    // cookie only works in https
                    secure: isProduction,
                    maxAge: 1000 * 60 * 60,
                    // maxAge: 1,
                    // JS FrontEnd cannot read (access) this cookies
                    httpOnly: true,
                    // protection against CSRF
                    sameSite: "lax",
                    domain: "http://localhost:3000"
                },
            })
        );
    }
}
