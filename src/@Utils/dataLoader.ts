import DataLoader from "dataloader";
import { In } from "typeorm";
import { VoteType } from "../@Commons/types/ExpressCtx";
import { User } from "../@Database/PostgreSQL/entities/User";
import { Vote } from "../@Database/PostgreSQL/entities/Vote";

interface VoteTypeCondition {
    postId: number;
    userId: number;
}

const batchGetUsers = async (userIds: number[]) => {
    // const users = await User.findByIds(userIds);
    const users = await User.findBy({ id: In(userIds) });
    return userIds.map((userId: number) =>
        users.find((user) => user.id === userId)
    );
};

export const buildDataLoaders = () => {
    return {
        userLoader: new DataLoader<number, User>((userIds: number[]) =>
            batchGetUsers(userIds)
        ),
        voteTypeLoader: new DataLoader<VoteTypeCondition, Vote>(
            (voteConditions: VoteTypeCondition[]) =>
                batchGetVoteType(voteConditions)
        ),
    };
};

const batchGetVoteType = async (voteTypeConditions: VoteTypeCondition[]) => {
    const votes = await Vote.findByIds(voteTypeConditions);
    console.log(
        "voteTypeConditions:",
        voteTypeConditions,
        votes,
        voteTypeConditions.length,
        votes.length
    );

    // const votes = await Vote.findBy({
    //     userId: In(voteTypeConditions),
    //     postId: In(voteTypeConditions),
    // });

    // test
    let x: any;
    const res = voteTypeConditions.map((voteCondition: VoteTypeCondition) => {
        const z = votes.find(
            (vote) =>
                voteCondition.postId === vote.postId &&
                voteCondition.userId === vote.userId
        );
        if (z && !x) x = z;
        return z ? [z] : null;
    })
    // .map((item) => (item ? [item] : [x]));
    console.log("res:", res, res.length);
    return res as any;
};

/**
 * query GetAllPosts {
    getAllPosts {
        id
        userId
        title
        text
        createdAt
        updatedAt
        textSnippet
        userId
        user {
            id
            email
            orgPassword
        }
        votes {
            userId
            postId
            value
        }
    }
}
 */

export const buildVoteTypeLoaders = () => {
    return {
        voteTypeLoader: new DataLoader<VoteTypeCondition, Vote>(
            (voteConditions: VoteTypeCondition[]) =>
                batchGetVoteType(voteConditions)
        ),
    };
};
