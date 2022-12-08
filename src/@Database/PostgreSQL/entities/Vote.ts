import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Vote extends BaseEntity {
    @Field()
    @PrimaryColumn()
    userId!: number;

    @Field()
    @PrimaryColumn()
    postId!: number;

    // @Field((_type) => [Post])
    @ManyToOne((_to) => Post, (post) => post.votes)
    post!: Post;

    // @Field((_type) => [User])
    @ManyToOne((_to) => User, (user) => user.votes)
    user!: User;

    @Field()
    @Column()
    value!: number;
}
