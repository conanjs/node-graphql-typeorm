import { Field, ObjectType } from "type-graphql";
import { ErrorField } from "../../../@Commons/types/ErrorField";
import { IMutationResponse } from "../../../@Commons/types/MutationResponse";
import { Post } from "../../../@Database/PostgreSQL/entities/Post";

@ObjectType({ implements: IMutationResponse })
export class PostMutationResponse extends IMutationResponse {
    // code: number;
    // success: boolean;
    // message?: string;

    @Field({ nullable: true })
    post?: Post;

    @Field((_type) => [ErrorField], { nullable: true })
    errors?: ErrorField[];
}
