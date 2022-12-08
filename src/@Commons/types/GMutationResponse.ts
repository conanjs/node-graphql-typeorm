import { Field, ObjectType } from "type-graphql";
import { ErrorField } from "./ErrorField";
import { IMutationResponse } from "./MutationResponse";

@ObjectType({ implements: IMutationResponse })
export class G_MutationResponse<DataType = any> extends IMutationResponse {
    code: number;
    success: boolean;
    message?: string;

    @Field({ nullable: true })
    data?: DataType;

    @Field((_type) => [ErrorField], { nullable: true })
    errors?: ErrorField[];
}
