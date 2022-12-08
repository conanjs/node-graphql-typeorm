import { Field, ID, ObjectType } from "type-graphql";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    UpdateDateColumn,
    CreateDateColumn,
    OneToMany,
} from "typeorm";
import { Post } from "./Post";
import { Vote } from "./Vote";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field((_type) => ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToMany(() => Post, (post) => post.user)
    posts: Post[];

    // @Field((_type) => [Vote])
    @OneToMany(() => Vote, (vote) => vote.user)
    votes: Vote[];

    @Field()
    @Column({ unique: true })
    username!: string;

    @Field()
    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Field()
    @Column({ nullable: true })
    orgPassword?: string;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;
}
