import dotenv from "dotenv";
dotenv.config();

type OptionsFlags<Type extends object> = {
    [Property in keyof Type as `${Uppercase<string & Property>}`]: string;
};

type EnvType = OptionsFlags<typeof Env>;

const envFor = (configName: string): string | undefined => {
    return process.env[configName] ?? undefined;
};

export const isProduction = envFor("NODE_ENV") === "production";

enum Env {
    PORT,
    DB_HOST,
    DB_USERNAME,
    DB_PASSWORD,
    DB_DBNAME,
    DB_TYPE,
    DB_PORT,
    DB_MONGOOSE_PASSWORD,
    DB_MONGOOSE_USERNAME,
    SECRET_COOKIES,
    RECOVERY_PWD_SECRET_TOKEN,
    COOKIES_NAME,
    DB_MONGOOSE_NAME,
    GOOGLE_USER_EMAIL,
    GOOGLE_USER_PASSWORD,
    SERVER_ENDPOINT,
    CLIENT_ENDPOINT,
    NODE_ENV,
    JWT_SECRET_TOKEN,
}

const ENV = Object.getOwnPropertyNames(Env).reduce<EnvType>(
    (inc: any, cur: keyof typeof Env) => {
        if (isNaN(cur as any))
            return {
                ...inc,
                [cur]: envFor(cur),
            };
    },
    {} as EnvType
);

// console.log("ENV:", ENV);

export default ENV;

// cannot use fromEntries to map EnvType type because its type is tied with { [k: string]: anything }
// const env = Object.fromEntries(
//     envArray.map(
//         (envKey) =>
//             [envKey as typeof envKey, envFor(envKey)] as [typeof envKey, string]
//     )
// );
type X = typeof envArray;
const envArray = [
    "PORT",
    "DB_HOST",
    "DB_USERNAME",
    "DB_PASSWORD",
    "DB_DBNAME",
    "DB_TYPE",
    "DB_PORT",
    "DB_MONGOOSE_PASSWORD",
    "DB_MONGOOSE_USERNAME",
    "SECRET_COOKIES",
] as const;
