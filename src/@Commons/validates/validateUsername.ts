export const validateUsername = (username: string) => {
    if (username.length <= 2) {
        return {
            message: "Invalid username!",
            errors: [
                {
                    field: "username",
                    message: "Username length must be greater than 2",
                },
            ],
        };
    }
};
