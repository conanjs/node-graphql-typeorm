import { Field, ID, ObjectType } from "type-graphql";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    UpdateDateColumn,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";
import { Vote } from "./Vote";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field((_type) => ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    userId!: number;

    @Field((_type) => User)
    @ManyToOne(() => User, (user: User) => user.posts)
    user: User;

    @Field((_type) => [Vote], { nullable: true })
    @OneToMany((_to) => Vote, (vote: Vote) => vote.post)
    votes?: Vote[];

    @Field()
    @Column({ unique: true })
    title!: string;

    @Field()
    @Column({ unique: true })
    text: string;

    @Field()
    @Column({ default: 0 })
    points!: number;

    @Field()
    @CreateDateColumn({ type: "timestamptz" })
    createdAt: Date;

    @Field()
    @UpdateDateColumn({ type: "timestamptz" })
    updatedAt: Date;
}
