import express from "express";
import jwt from "jsonwebtoken";
import ENV from "../../../@Config/env";

const authRouter = express.Router();

authRouter.post("/", async (_req, res) => {
    const token = await jwt.sign(
        {
            "https://hasura.io/jwt/claims": {
                "x-hasura-allowed-roles": ["admin"],
                "x-hasura-default-role": "admin",
            },
        },
        ENV.JWT_SECRET_TOKEN
    );

    console.log("token: ", token);

    return res.status(200).json({ token });
});

export { authRouter };
