import argon2 from "argon2";
import jwt from "jsonwebtoken";
import jwt_decode from "jwt-decode";

const f1 = async () => {
    const hash = "aabasbs2134121jsonwebtoken23Asababasbab";
    let x, y, token;
    console.log((x = await argon2.hash(hash)));
    console.log((y = await argon2.hash(hash)));
    console.log(await argon2.argon2id);
    console.log((token = await jwt.sign({ userId: 1, uid: 12 }, hash)));
    console.log(await jwt.decode(token));
    console.log(await jwt.verify(token, hash));
    console.log(await jwt_decode(token));
};

f1();
