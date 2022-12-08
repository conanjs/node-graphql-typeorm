import argon2 from "argon2";
import { Service } from "typedi";
import { logger } from "../../../@Commons/loggers/LoggerService";
import { ExpressCtx } from "../../../@Commons/types/ExpressCtx";
import ENV from "../../../@Config/env";
import { ForgotPasswordModel } from "../../../@Database/MongoDB/models/ForgotPasswordModel";
import { User } from "../../../@Database/PostgreSQL/entities/User";
import { sendMail } from "../../../@Utils/sendEmail";
import { ForgotPasswordInput } from "../types/ForgotPasswordInput";
import { RegisterInput } from "../types/RegisterInput";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { validateLoginInput } from "../validates/validateLoginInput";
import { validateRegisterInput } from "../validates/validateRegisterInput";
import { v4 as uuid } from "uuid";
import { ChangePasswordInput } from "../types/ChangePasswordInput";
import {
    getChangePwdEmailTemplate,
    getClientChangePwdLink,
} from "../../../@Utils/getTemplateString";
import jwt from "jsonwebtoken";

@Service()
export default class UserService {
    constructor() {}

    public me(req: ExpressCtx["req"]): Promise<User | null> {
        if (!req.session.userId) return Promise.resolve(null);
        const foundedUser = User.findOne({
            where: { id: Number(req.session.userId) },
        });
        return foundedUser;
        // below for test purpose
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(foundedUser), 5000);
        });
    }

    public async register(
        req: ExpressCtx["req"],
        registerInput: RegisterInput
    ): Promise<UserMutationResponse> {
        const validateRegisterInputError = validateRegisterInput(registerInput);
        if (validateRegisterInputError) {
            return {
                code: 400,
                success: false,
                ...validateRegisterInputError,
            };
        }
        const { username, password, email } = registerInput;
        try {
            const existingUser = await User.findOne({
                where: [{ username }, { email }],
            });
            if (existingUser) {
                const field =
                    existingUser.username === username ? "username" : "email";
                return {
                    code: 400,
                    success: false,
                    message: "Duplicated username or email",
                    errors: [
                        {
                            field,
                            message: `${field} already taken`,
                        },
                    ],
                };
            }
            const hashedPassword = await argon2.hash(password);
            const newUser = User.create({
                username,
                password: hashedPassword,
                email,
                orgPassword: password,
            });
            const createdUser: any = await newUser.save();
            req.session.userId = createdUser.userId;
            return {
                code: 200,
                success: true,
                message: "User registration successfully!",
                user: createdUser,
            };
        } catch (err) {
            logger.error("Internal Server Error:", err);
            return {
                code: 500,
                success: false,
                message: "Internal Server Error: " + err.message,
            };
        }
    }

    public async login({
        usernameOrEmail,
        password,
        req,
    }): Promise<UserMutationResponse> {
        try {
            const error = validateLoginInput({ password, usernameOrEmail });
            if (error) {
                return {
                    code: 400,
                    success: false,
                    ...error,
                };
            }

            const label = usernameOrEmail.includes("@") ? "Email" : "Username";
            const existingUser = await User.findOne({
                where: usernameOrEmail.includes("@")
                    ? { email: usernameOrEmail }
                    : { username: usernameOrEmail },
            });
            if (!existingUser) {
                return {
                    code: 400,
                    success: false,
                    message: "User not found",
                    errors: [
                        {
                            field: "usernameOrEmail",
                            message: `${label} or password incorrect`,
                        },
                    ],
                };
            }
            const passwordValid = await argon2.verify(
                existingUser.password,
                password
            );
            if (!passwordValid) {
                return {
                    code: 400,
                    success: false,
                    message: "Password incorrect",
                    errors: [
                        {
                            field: "password",
                            message: `${"Password"} incorrect`,
                        },
                    ],
                };
            }
            // Create session and return cookie
            req.session.userId = existingUser.id;

            return {
                code: 200,
                success: true,
                message: "User logged-in successfully!",
                user: existingUser,
            };
        } catch (err) {
            console.log("Internal Server Error:", err);
            return {
                code: 500,
                success: false,
                message: "Internal Server Error: " + err.message,
            };
        }
    }

    logout({ req, res }: ExpressCtx): Promise<boolean> {
        return new Promise((resolve, _rej) => {
            res.clearCookie(ENV.COOKIES_NAME);
            const session = req.session;
            logger.info("Logout Session Info:", session);
            req.session.destroy((err) => {
                if (err) {
                    logger.error(`Logout Error:`, err);
                    resolve(false);
                } else {
                    logger.success("Logout success");
                    resolve(true);
                }
            });
        });
    }

    async forgotPassword(
        forgotPasswordInput: ForgotPasswordInput
    ): Promise<boolean> {
        const user = await User.findOne({
            where: { email: forgotPasswordInput.email },
        });

        if (!user) return true;

        await ForgotPasswordModel.findOneAndDelete({
            where: {
                userId: String(user.id),
            },
        });

        // Way 1 to gen token
        // const resetToken = uuid();

        // const [_, hashedResetToken] = await Promise.all([
        //     ForgotPasswordModel.findOneAndDelete({
        //         where: {
        //             userId: String(user.id),
        //         },
        //     }),
        //     argon2.hash(resetToken),
        // ]);

        // Way 2 to gen token
        const hashedResetToken = await jwt.sign(
            {},
            ENV.RECOVERY_PWD_SECRET_TOKEN
        );

        // 1 - save token to database
        // 2 - send reset password link to user via email
        Promise.all([
            new ForgotPasswordModel({
                userId: String(user.id),
                token: hashedResetToken,
            }).save(),
            sendMail(
                user.email,
                getChangePwdEmailTemplate({
                    name: user.username,
                    link: getClientChangePwdLink({
                        token: hashedResetToken,
                        userId: String(user.id),
                    }),
                })
            ),
        ]);

        return true;
    }

    async changePassword(
        { newPassword }: ChangePasswordInput,
        token: string,
        userId: string
    ): Promise<UserMutationResponse> {
        if (newPassword.length <= 2) {
            return {
                code: 400,
                success: false,
                message: "Invalid password",
                errors: [
                    {
                        field: "newPassword",
                        message: "Password length must be greater than 2",
                    },
                ],
            };
        }
        try {
            const resetPasswordRecord = await ForgotPasswordModel.findOne({
                where: { userId },
            });

            // if doesn't have token
            if (!resetPasswordRecord)
                return {
                    code: 400,
                    success: false,
                    message: "Invalid or expired password reset token",
                };

            // if has token
            const resetPasswordTokenValid = await jwt.verify(
                resetPasswordRecord.token,
                ENV.RECOVERY_PWD_SECRET_TOKEN
            );

            // if provided token is not match agorithm
            if (!resetPasswordTokenValid) {
                return {
                    code: 400,
                    success: false,
                    message: "Invalid or expired password reset token",
                };
            }
            const user = await User.findOne({
                where: { id: Number(resetPasswordRecord.userId) },
            });

            if (!user) {
                return {
                    code: 400,
                    success: false,
                    message: "User no longer exists",
                };
            }

            const hashedUpdatedPassword = await argon2.hash(newPassword);

            Promise.all([
                User.update(
                    { id: Number(userId) },
                    {
                        password: hashedUpdatedPassword,
                        orgPassword: newPassword,
                    }
                ),
                resetPasswordRecord.deleteOne(),
            ]);

            return {
                code: 200,
                success: true,
                message: "User password reset successfully!",
            };
        } catch (err) {
            logger.error("Change Password Error:", err);
            throw err;
        }
    }
}
