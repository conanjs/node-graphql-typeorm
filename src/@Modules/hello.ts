import { Ctx, Query, Resolver } from "type-graphql";
import { logger } from "../@Commons/loggers/LoggerService";
import { ExpressCtx } from "../@Commons/types/ExpressCtx";

@Resolver()
export class HelloResolver {
    @Query((_returns) => String)
    hello(@Ctx() { req }: ExpressCtx) {
        logger.info(`session.userId: ${req.session}`);
        return "hello world!";
    }
}
