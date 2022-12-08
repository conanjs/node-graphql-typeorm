import {
    ApolloServerPluginDrainHttpServer,
    ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { ApolloServer, ExpressContext } from "apollo-server-express";
import { buildSchema, NonEmptyArray, ResolverData } from "type-graphql";
import { HelloResolver } from "../../@Modules/hello";
import { UserResolver } from "../../@Modules/user/resolvers/UserResolver";
import { Server } from "http";
import { GraphQLError } from "graphql";
import {
    ReasonPhrases,
    StatusCodes,
    getReasonPhrase,
    getStatusCode,
} from "http-status-codes";
import { logger } from "../../@Commons/loggers/LoggerService";
// import your IoC container
import { Container } from "typedi";
import { PostResolver } from "../../@Modules/post/resolvers/PostResolver";
import { ExpressCtx } from "../../@Commons/types/ExpressCtx";
import { AppDataSource } from "../../@Database/PostgreSQL/migration/app-data-source";
import { buildDataLoaders } from "../../@Utils/dataLoader";

const resolvers: NonEmptyArray<Function> = [
    HelloResolver,
    UserResolver,
    PostResolver,
];

const createApolloServer = async (httpServer: Server) => {
    return new ApolloServer<ExpressCtx>({
        schema: await buildSchema({
            resolvers,
            validate: true,
            container: Container,
            // container: ({ context }: ResolverData<any>) =>
            //     Container.of(context.requestId),
        }),

        context: ({ req, res }): ExpressCtx => {
            // const requestId = Math.floor(
            //     Math.random() * Number.MAX_SAFE_INTEGER
            // ); // uuid-like
            // const container = Container.of(requestId.toString()); // get the scoped container
            // const context = { requestId, container, req, res }; // create fresh context object
            // container.set("context", context); // place context or other data in container
            return { req, res, AppDataSource, dataLoaders: buildDataLoaders() };
            // return context;
        },
        formatError: (error) => {
            logger.error("GraphQL Error Response:", error);

            // throw new GraphQLError(
            //     "abc",
            //     null,
            //     null,
            //     null,
            //     ["path here"],
            //     { message: "1", name: "NAME" },
            //     { code: StatusCodes.CONFLICT }
            // );
            // return {
            //     message: error.message,
            //     path: error.path,
            //     locations: error.locations,
            //     error,
            // };
            // throw error;
            return error;
        },
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
        // plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    });
};
export default createApolloServer;
