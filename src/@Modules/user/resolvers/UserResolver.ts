import {
    Resolver,
    Mutation,
    Arg,
    Query,
    Ctx,
    FieldResolver,
    Root,
} from "type-graphql";
import { User } from "../../../@Database/PostgreSQL/entities/User";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { RegisterInput } from "../types/RegisterInput";
import { LoginInput } from "../types/LoginInput";
import { ExpressCtx } from "../../../@Commons/types/ExpressCtx";
import { ExpressContext } from "apollo-server-express";
import { Service } from "typedi";
import { logger } from "../../../@Commons/loggers/LoggerService";
import { ForgotPasswordInput } from "../types/ForgotPasswordInput";
import { ChangePasswordInput } from "../types/ChangePasswordInput";
import UserService from "../services/UserService";

@Service()
@Resolver((_of) => User)
export class UserResolver {
    constructor(private readonly userService: UserService) {}

    @FieldResolver((_return) => String, { nullable: true })
    email(@Root() rootUser: User, @Ctx() { req }: ExpressCtx) {
        if (rootUser.id === req.session.userId) {
            return rootUser.email;
        } else return "";
    }

    @Query((_return) => User, { nullable: true })
    me(@Ctx() { req }: ExpressCtx): Promise<User | null> {
        return this.userService.me(req);
    }

    @Mutation((_return) => User)
    test(): any {
        return {
            id: 100,
            email: "email",
            username: "username",
            createdAt: new Date(),
            updatedAt: new Date(),
            posts: [],
        };
    }

    @Mutation((_returns) => UserMutationResponse)
    async register(
        @Arg("registerInput") registerInput: RegisterInput,
        @Ctx() { req, res: _res }: ExpressCtx
    ): Promise<UserMutationResponse | null> {
        return this.userService.register(req, registerInput);
    }

    @Query((_returns) => User, { nullable: true })
    async findSingleUserByEmail(
        @Arg("email", { nullable: true }) email: string
    ) {
        const existingUser = await User.findOneBy({ email });
        if (existingUser) {
            return existingUser;
        } else return null;
    }

    @Mutation((_return) => UserMutationResponse)
    async login(
        @Arg("loginInput") { usernameOrEmail, password }: LoginInput,
        @Ctx()
        { req, res: _res }: ExpressCtx
    ): Promise<UserMutationResponse> {
        return this.userService.login({ usernameOrEmail, password, req });
    }

    @Mutation((_return) => Boolean)
    logout(
        @Ctx()
        { req, res }: ExpressCtx
    ): Promise<boolean> {
        logger.success("User Logout Successfully:");
        return this.userService.logout({ req, res });
    }

    @Mutation((_return) => Boolean)
    async forgotPassword(
        @Arg("forgotPasswordInput") forgotPasswordInput: ForgotPasswordInput
    ): Promise<boolean> {
        return this.userService.forgotPassword(forgotPasswordInput);
    }

    @Mutation((_return) => UserMutationResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("userId") userId: string,
        @Arg("changePasswordInput") changePasswordInput: ChangePasswordInput
    ): Promise<UserMutationResponse> {
        return this.userService.changePassword(
            changePasswordInput,
            token,
            userId
        );
    }
}
