import { MaxLength } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class LoginInput {
    @Field()
    // @MaxLength(2)
    usernameOrEmail!: string;

    @Field()
    // @MaxLength(2)
    password!: string;
}
