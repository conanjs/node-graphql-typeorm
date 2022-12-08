import { AuthenticationError } from "apollo-server-express";
import { MiddlewareFn } from "type-graphql";
import { ExpressCtx } from "../@Commons/types/ExpressCtx";

export const checkAuth: MiddlewareFn<ExpressCtx> = async (
    { context: { req } },
    next
) => {
    if (!req.session.userId)
        throw new AuthenticationError(
            "Not authenticated to perform GraphQL Operation!"
        );
    return next();
};
