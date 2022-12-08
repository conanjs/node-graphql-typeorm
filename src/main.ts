import Application from "./app";

console.time('Time taken to start server')
const appServer = new Application();
appServer.startServer();
export {};
