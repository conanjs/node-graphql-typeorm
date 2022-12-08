import type { Session, SessionData } from "express-session";
import type { ExpressContext } from "apollo-server-express";
import type { Request } from "express";
import { DataSource } from "typeorm";
import { buildDataLoaders } from "../../@Utils/dataLoader";

export type ExpressCtx = ExpressContext & {
    req: Request & {
        session: Session & Partial<SessionData> & { userId: number | string };
    };
    AppDataSource?: DataSource;
    dataLoaders?: ReturnType<typeof buildDataLoaders>;
};

export enum VoteType {
    UpVote = 1,
    DownVote = -1,
}
