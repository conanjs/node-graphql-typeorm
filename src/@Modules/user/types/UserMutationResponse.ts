import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "../../../@Commons/types/MutationResponse";
import { User } from "../../../@Database/PostgreSQL/entities/User";
import { ErrorField } from "../../../@Commons/types/ErrorField";

@ObjectType({ implements: IMutationResponse })
export class UserMutationResponse extends IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    user?: User;

    @Field((_type) => [ErrorField], { nullable: true })
    errors?: ErrorField[];
}
