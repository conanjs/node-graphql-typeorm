import { Field, ObjectType } from "type-graphql";
import { Post } from "../../../@Database/PostgreSQL/entities/Post";

@ObjectType()
export class PaginatedPosts {
    @Field()
    totalCount!: number;

    @Field((_type) => Date)
    cursor!: Date;

    @Field()
    hasMore!: boolean;

    @Field((_type) => [Post])
    paginatedPosts!: Post[];
}
