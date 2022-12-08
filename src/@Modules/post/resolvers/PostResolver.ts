import { AuthenticationError } from "apollo-server-express";
import {
    Arg,
    Ctx,
    FieldResolver,
    ID,
    Int,
    Mutation,
    Query,
    registerEnumType,
    Resolver,
    Root,
    UseMiddleware,
} from "type-graphql";
import { Service } from "typedi";
import { FindManyOptions, LessThan } from "typeorm";
import { logger } from "../../../@Commons/loggers/LoggerService";
import { ExpressCtx, VoteType } from "../../../@Commons/types/ExpressCtx";
import { Post } from "../../../@Database/PostgreSQL/entities/Post";
import { User } from "../../../@Database/PostgreSQL/entities/User";
import { Vote } from "../../../@Database/PostgreSQL/entities/Vote";
import { checkAuth } from "../../../@Middlewares/checkAuth";
import {
    buildDataLoaders,
    buildVoteTypeLoaders,
} from "../../../@Utils/dataLoader";
import { PostService } from "../services/PostService";
import { CreatePostInput } from "../types/CreatePostInput";
import { PaginatedPosts } from "../types/PaginatedPosts";
import { PostMutationResponse } from "../types/PostMutationResponse";
import { SelectBy } from "../types/SelectBy";
import { UpdatePostInput } from "../types/UpdatePostInput";

registerEnumType(VoteType, {
    name: "VoteType",
});

@Service()
@Resolver((_of) => Post)
export class PostResolver {
    constructor(private readonly postService: PostService) {}

    // @UseMiddleware(checkAuth)
    @Query((_return) => PaginatedPosts, { nullable: true })
    async posts(
        @Arg("limit", (_Type) => Int) limit: number,
        @Arg("cursor", { nullable: true }) cursor: string
    ): Promise<PaginatedPosts> {
        return this.postService.posts({ limit, cursor });
    }

    @FieldResolver((_return) => String)
    textSnippet(@Root() rootPost: Post) {
        return rootPost.text.slice(0, 50);
    }

    /** This field "selectBy" is not appear in the column of database table
     *  it just a feature of graphql schema, so whenever client trigger a query or mutation
     *  and query data structures has "this entity on the Resolver Decorator" and also has this field
     *  => It is automatically execute this function to resolve field on the response result
     */
    @FieldResolver((_return) => SelectBy, { nullable: true })
    selectBy(
        @Root() rootPost: Post,
        @Ctx()
        {
            req: {
                session: { userId },
            },
            // dataLoaders: { selectLoader }
        }: ExpressCtx
    ): SelectBy | null {
        console.log('selectBy run:', userId, rootPost)
        if (userId) {
            const filterVotes = rootPost.votes?.filter(
                (vote) => vote.userId === userId
            );
            return {
                me: !!filterVotes?.[0],
                value: filterVotes?.[0]?.value,
            };
        }
    }

    // This approach can solve the problem but not performance
    // because it need to communicate to database (user table) multiple time for each post
    // @FieldResolver((_return) => User)
    // async user(@Root() rootPost: Post) {
    //     return User.findOne({ where: { id: rootPost.userId } });
    // }

    /** No matter "user" field is appear or not in the column of database table
     *  it just a feature of graphql schema, so whenever client trigger a query or mutation
     *  and query data structures has "this entity on the Resolver Decorator" and also has this field
     *  => It is automatically to execute this function to resolve field on the response result
     *  And Dataloader will batch many queries to one-time talk with database
     *  But this is async operation so if you have another "Field Resolver"
     *  that depend on this result => DON"T DO THAT SH!T
     *  BECAUSE that field resolver is executed synchronously so it won't have async operation results
     */
    @FieldResolver((_return) => User)
    async user(
        @Root() rootPost: Post,
        @Ctx() { dataLoaders: { userLoader } }: ExpressCtx
    ) {
        const userLoaderDirectly = buildDataLoaders();
        // return await userLoaderDirectly.userLoader.load(rootPost.userId);
        return await userLoader.load(rootPost.userId);
    }

    @FieldResolver((_return) => [Vote])
    async votes(
        @Root() rootPost: Post,
        @Ctx() { dataLoaders: { voteTypeLoader }, req: { session: { userId }} }: ExpressCtx
    ) {
        const voteTypeLoaderDirectly = buildVoteTypeLoaders();
        console.log("votes:", {
            userId: rootPost.userId,
            postId: rootPost.id,
        });
        return await voteTypeLoader.load({
            userId: userId as number,
            postId: rootPost.id,
        });
        return await voteTypeLoaderDirectly.voteTypeLoader.load({
            userId: rootPost.userId,
            postId: rootPost.id,
        });
    }

    @Mutation((_return) => PostMutationResponse, { nullable: true })
    async createPost(
        @Arg("createPostInput") createPostInput: CreatePostInput,
        @Ctx() { req }: ExpressCtx
    ): Promise<PostMutationResponse | null> {
        return this.postService.createPost(createPostInput, req);
    }

    // @UseMiddleware(checkAuth)
    @Query((_return) => [Post], { nullable: true })
    getAllPosts(@Ctx() { req, res: _res }: ExpressCtx): Promise<Post[] | null> {
        console.log("req.session:", req.session);
        return this.postService.getAllPosts();
    }

    @Query((_return) => Post, { nullable: true })
    getPostById(@Arg("id", (_type) => ID) id: number): Promise<Post | null> {
        return this.postService.getPostById(id);
    }

    @Mutation((_return) => PostMutationResponse, { nullable: true })
    async updatePost(
        @Arg("updatePostInput") updatePostInput: UpdatePostInput,
        @Ctx() { req }: ExpressCtx
    ): Promise<PostMutationResponse | null> {
        return this.postService.updatePost(updatePostInput, req);
    }

    @Mutation((_return) => PostMutationResponse)
    async deletePost(
        @Arg("id", (_type) => ID) id: number,
        @Ctx() { req }: ExpressCtx
    ): Promise<PostMutationResponse | null> {
        return this.postService.deletePost(id, req);
    }

    @UseMiddleware(checkAuth)
    @Mutation((_return) => PostMutationResponse)
    async vote(
        @Arg("postId", (_type) => Int) postId: number,
        @Arg("voteType", (_type) => VoteType) voteType: VoteType,
        @Ctx() { req, AppDataSource }: ExpressCtx
    ): Promise<PostMutationResponse | null> {
        return this.postService.vote({ postId, req, voteType, AppDataSource });
    }
}
