import { StatusCodes } from "http-status-codes";
import { Service } from "typedi";
import { EntityManager, FindManyOptions, LessThan } from "typeorm";
import { logger } from "../../../@Commons/loggers/LoggerService";
import { ExpressCtx, VoteType } from "../../../@Commons/types/ExpressCtx";
import { Post } from "../../../@Database/PostgreSQL/entities/Post";
import { CreatePostInput } from "../types/CreatePostInput";
import { PaginatedPosts } from "../types/PaginatedPosts";
import { PostMutationResponse } from "../types/PostMutationResponse";
import { UpdatePostInput } from "../types/UpdatePostInput";
import { UserInputError } from "apollo-server-express";
import { Vote } from "../../../@Database/PostgreSQL/entities/Vote";

@Service()
export class PostService {
    constructor() {}

    async posts({
        limit,
        cursor,
    }: {
        limit: number;
        cursor?: string;
    }): Promise<PaginatedPosts> {
        let hasMore: boolean;
        const realLimit = Math.min(10, limit);

        const findOptions: FindManyOptions<Post> = {
            relations: ["user", "votes"],
            order: {
                createdAt: "DESC",
            },
            take: realLimit,
        };

        if (cursor) {
            findOptions.where = {
                createdAt: LessThan(cursor as any),
            };
        }

        try {
            const [paginatedPosts, totalCount, ascOldestPosts] =
                await Promise.all([
                    Post.find(findOptions),
                    Post.count(),
                    cursor
                        ? Post.find({ order: { createdAt: "ASC" }, take: 1 })
                        : null,
                ]);

            if (!cursor) {
                hasMore = paginatedPosts.length < totalCount;
            } else {
                if (!paginatedPosts.length) {
                    hasMore = false;
                } else
                    hasMore =
                        ascOldestPosts[0]?.createdAt.toString() !==
                        paginatedPosts.at(-1).createdAt.toString();
            }

            // paginatedPosts.forEach(item => {
            //     item.title = item.title + item.id;
            // })
            const response = {
                totalCount,
                cursor:
                    paginatedPosts[paginatedPosts.length - 1]?.createdAt ??
                    (cursor ? new Date(cursor) : null),
                hasMore,
                paginatedPosts,
            };
            return response;
            // Below for testing purposes only
            return await new Promise((res) => {
                setTimeout(() => res(response), 0);
            });
        } catch (err) {
            logger.log("err:", err);
            throw err;
        }
    }

    async createPost(
        createPostInput: CreatePostInput,
        req: ExpressCtx["req"]
    ): Promise<PostMutationResponse> {
        const newPost = Post.create({
            ...createPostInput,
            userId: Number(req.session.userId),
        });

        try {
            const savedPost = await newPost.save();
            logger.success("Create Post Successfully:", savedPost);
            return {
                success: true,
                code: 200,
                message: "Post created successfully",
                post: savedPost,
            };
        } catch (err) {
            logger.error("Create Post Failure:", err);
        }
    }

    getAllPosts(): Promise<Post[] | null> {
        return Post.find({
            // relations: ["user"],
        });
    }

    getPostById(id: number): Promise<Post> {
        return Post.findOne({
            relations: ["votes"],
            where: { id },
        });
    }

    async updatePost(
        { id, title, text }: UpdatePostInput,
        req: ExpressCtx["req"]
    ): Promise<PostMutationResponse | null> {
        const post = await Post.findOne({
            relations: ["votes"],
            where: { id },
        });

        if (!post) {
            return Promise.resolve({
                code: 404,
                success: false,
                message: "Post not found",
            });
        }

        if (post.userId !== req.session.userId) {
            return {
                code: StatusCodes.UNAUTHORIZED,
                success: false,
                message: "User not authorized",
            };
        }

        // const updatedPost = await Post.update({ id }, { title, text });
        // logger.info("Updated post:", updatedPost);

        post.title = title;
        post.text = text;
        await post.save();

        return {
            code: 200,
            success: true,
            message: "Post updated Successfully",
            post,
        };
    }

    async deletePost(
        id: number,
        req: ExpressCtx["req"]
    ): Promise<PostMutationResponse | null> {
        const post = await Post.findOne({ where: { id } });
        if (!post) {
            return Promise.resolve({
                code: 404,
                success: false,
                message: "Post not found",
            });
        }

        if (post.userId !== req.session.userId) {
            return {
                code: StatusCodes.UNAUTHORIZED,
                success: false,
                message: "User not authorized",
            };
        }

        await Post.delete({ id });
        return {
            code: 200,
            message: "Post deleted Successfully",
            success: true,
            post,
        };
    }

    async vote({
        req: {
            session: { userId },
        },
        postId,
        voteType: vote,
        AppDataSource,
    }: Partial<ExpressCtx> & {
        postId: number;
        voteType: VoteType;
    }): Promise<PostMutationResponse | null> {
        return await AppDataSource.transaction(
            async (transactionEntityManager: EntityManager) => {
                const [post, voteFromDB]: [Post, Vote] = await Promise.all([
                    transactionEntityManager.findOne(Post, {
                        relations: ["votes", "user"],
                        where: { id: postId },
                    }),
                    transactionEntityManager.findOne(Vote, {
                        where: { postId, userId: Number(userId) },
                    }),
                ]);

                console.log("post:", post);

                if (!post) {
                    throw new UserInputError("Post not found");
                }

                let createOrUpdateVote: Vote;
                const responseFromServer = {
                    success: true,
                    code: 200,
                    message: "Post voted",
                    post,
                };

                if (!voteFromDB) {
                    createOrUpdateVote = transactionEntityManager.create(Vote, {
                        userId: Number(userId),
                        postId,
                        value: vote,
                    });
                    post.points = post.points + vote;
                } else if (voteFromDB.value !== vote) {
                    createOrUpdateVote =
                        ((voteFromDB.value = vote), voteFromDB);
                    if (post.points === 1 && vote === VoteType.DownVote) {
                        post.points = post.points - 2;
                    } else if (post.points >= 0 && vote === VoteType.UpVote) {
                        post.points = post.points + 1;
                    } else if (post.points > 1 && vote === VoteType.DownVote) {
                        post.points = post.points - 1;
                    } else if (post.points === -1 && vote === VoteType.UpVote) {
                        post.points = post.points + 2;
                    } else if (post.points < -1 && vote === VoteType.DownVote) {
                        post.points = post.points - 1;
                    } else if (post.points < -1 && vote === VoteType.UpVote) {
                        post.points = post.points + 1;
                    }
                } else {
                    return responseFromServer;
                }

                const [_, newPost] = await Promise.all([
                    createOrUpdateVote?.save(),
                    transactionEntityManager.save(post),
                ]);
                console.log("newPost:", newPost);

                return {
                    ...responseFromServer,
                    post: await transactionEntityManager.findOne(Post, {
                        relations: ["votes", "user"],
                        where: { id: postId },
                    }),
                };
            }
        );
    }
}
