import { logger } from "../../../@Commons/loggers/LoggerService";
import { AppDataSource } from "./app-data-source";
import { isProduction } from '../../../@Config/env';

const startPostgreSQLDatabaseMigration = async () => {
    return AppDataSource.initialize()
        .then(async () => {
            // const y: any = 1;
            // y();
            if (isProduction) await AppDataSource.runMigrations();
            logger.success("PostgreSQL Database Migration Successfully!");
        })
        .catch((error: any) => {
            logger.error(`PostgreSQL Database Migration Error: ${error}`);
            process.exit(1);
        });
};

export default startPostgreSQLDatabaseMigration;
