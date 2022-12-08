import mongoose from "mongoose";
import { logger } from "../../@Commons/loggers/LoggerService";
import env from "./../../@Config/index";

export const MONGO_DB_URL = `mongodb+srv://javascript:${env.DB_MONGOOSE_PASSWORD}@mongo1.bzxlkgy.mongodb.net/${env.DB_MONGOOSE_NAME}?retryWrites=true&w=majority`;

const connectToMongoDB = async () => {
    return mongoose
        .connect(MONGO_DB_URL)
        .then(() => {
            logger.success("Connect to MongoDB successfully!");
        })
        .catch((err: any) => {
            logger.error(`Connect to MongoDB failed! ${err}`);
            process.exit(1);
        });
};

export default connectToMongoDB;
