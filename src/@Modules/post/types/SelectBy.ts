import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class SelectBy {
    @Field()
    me!: boolean;

    @Field({ nullable: true })
    value?: number;
}
