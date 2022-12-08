import type { Session, SessionData } from "express-session";
import type { ExpressContext } from "apollo-server-express";

export type Ctx1 = ExpressContext & {
    req: Request & {
        session: Session & Partial<SessionData> & { userId: number | string };
    };
};

export enum VoteType1 {
    UpVote = 1,
    DownVote = -1,
}
