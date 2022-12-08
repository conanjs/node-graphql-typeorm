import { LoginInput } from "../types/LoginInput";

export const validateLoginInput = (loginInput: LoginInput) => {
    const field = loginInput.usernameOrEmail.includes("@")
        ? "email"
        : "username";
    if (field === "email") {
        if (!loginInput.usernameOrEmail.includes("@")) {
            return {
                message: "Invalid email!",
                errors: [
                    { field: "usernameOrEmail", message: "Email must include @ symbol" },
                ],
            };
        }

        if (loginInput.usernameOrEmail.length <= 2) {
            return {
                message: "Invalid email!",
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: "Email length must be greater than 2",
                    },
                ],
            };
        }
    } else {
        if (loginInput.usernameOrEmail.length <= 2) {
            return {
                message: "Invalid username!",
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: "Username length must be greater than 2",
                    },
                ],
            };
        }
        if (loginInput.usernameOrEmail.includes("@")) {
            return {
                message: "Invalid username!",
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: "Username cannot include @ symbol",
                    },
                ],
            };
        }
    }

    if (loginInput.password.length <= 2) {
        return {
            message: "Invalid password!",
            errors: [
                {
                    field: "password",
                    message: "Password length must be greater than 2",
                },
            ],
        };
    }
};
