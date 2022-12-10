import { ApolloServer } from "apollo-server-express";
import express, { Application as ApplicationType } from "express";
import http from "http";
import "reflect-metadata";
import type { A } from "../t";
import { logger } from "./@Commons/loggers/LoggerService";
import env, { ConfigService, isProduction } from "./@Config";
import connectToMongoDB from "./@Database/MongoDB";
import startPostgreSQLDatabaseMigration from "./@Database/PostgreSQL";
import { AppDataSource } from "./@Database/PostgreSQL/migration/app-data-source";
import createApolloServer from "./@Server/apolloServer/apolloServer";
import { initializeRestRouter } from "./@Server/restHttpServer/initialize";
import { sendMail } from "./@Utils/sendEmail";
const x: A.X = { a: "a" };
export default class Application {
    private readonly app: ApplicationType = express();
    private readonly httpServer = http.createServer(this.app);
    private apolloServer: ApolloServer;
    private readonly configService = new ConfigService(this.app);

    constructor() {
        // Set up middleware service
        // Use cors
        this.configService.useCors();

        // Set trust proxy
        this.configService.trustProxy();

        // Set up session/cookies store
        // connect mongoose server
        this.configService.useSessionStore();
    }
    async startServer() {
        try {
            // sendMail("doquangvinh0708co@gmail.com", "<b>Hello Bae!</b>");
            [this.apolloServer] = await Promise.all([
                createApolloServer(this.httpServer),
                initializeRestRouter(this.app),
            ]);

            await Promise.all([
                this.apolloServer.start().then(() => {
                    this.apolloServer.applyMiddleware({
                        app: this.app,
                        cors:
                            // false,
                            {
                                origin: [
                                    "http://localhost:3000",
                                    "https://studio.apollographql.com",
                                ],
                                credentials: true,
                            },
                    });
                }),
                connectToMongoDB(),
                startPostgreSQLDatabaseMigration(),
            ]);

            return this.bootAppServer();
        } catch (err: any) {
            logger.error("App Server Error:", err);
            throw err;
        }
    }
    async bootAppServer() {
        const port: any = process.env.PORT || 3009;
        this.app.listen(port, () => {
            logger.success(
                `Server now is listening on port ${port}. GraphQL Apollo Server started on http://localhost:${port}${this.apolloServer.graphqlPath}`
            );
        });
        console.timeEnd("Time taken to start server");
    }
}
