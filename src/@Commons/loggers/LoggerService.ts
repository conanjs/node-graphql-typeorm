import chalk from "chalk";
import { localNow } from "../../@Utils/localNow";

type LoggerStatusOptions = {
    replacer?: (this: any, key: string, value: any) => any;
    spaces?: string | number | null;
    color?: string;
    status?: string;
};

const { log } = console;
export default class LoggerService {
    constructor() {}

    private advanceLog(logValueArray: any[], options?: LoggerStatusOptions) {
        const logMap = logValueArray.map((item) => {
            if (typeof item === "object") return JSON.stringify(item);
            return item;
        });
        const commonLog = this.handlePrettyLog(options);
        log(commonLog, ...logMap);
    }

    time(message: string, callback: Function) {
        console.time(message);
        if (callback.constructor.name === "Function") {
            callback();
            console.timeEnd(message);
        } else if (callback.constructor.name === "AsyncFunction") {
            callback().then(() => {
                console.timeEnd(message);
            });
        }
    }

    handlePrettyLog(options: LoggerStatusOptions) {
        const status = options?.status;
        const now = chalk.magenta(
            `[${localNow()
                .toISOString()
                .slice(0, 19)
                .replace(/-/g, "/")
                .replace("T", " - ")}]`
        );
        let logValue = "";
        let bg = "";
        let prettyStatus = "";
        if (status) {
            if (status === "success") bg = "bgGreen";
            else if (status === "error") bg = "bgRed";
            else if (status === "info") bg = "bgBlue";
            else if (status === "warn") bg = "bgYellow";
            prettyStatus = chalk[bg].bold(`[${status.toUpperCase()}]`);
        }
        if (prettyStatus) logValue = `${now} ${prettyStatus} >`;
        else logValue = `${now} >`;
        return logValue;
    }

    json(...thing: any[]) {
        return this.advanceLog(thing);
    }

    log(...thing: any[]) {
        let logValue = this.handlePrettyLog({});
        return log(logValue, ...thing);
    }

    success(...thing: any[]) {
        this.advanceLog(thing, {
            status: "success",
        });
    }

    error(...thing: any[]) {
        this.advanceLog(thing, {
            status: "error",
        });
    }

    info(...thing: any[]) {
        this.advanceLog(thing, {
            status: "info",
        });
    }

    warn(...thing: any[]) {
        this.advanceLog(thing, {
            status: "warn",
        });
    }
}
const logger = new LoggerService();
export { logger };
