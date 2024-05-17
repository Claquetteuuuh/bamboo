import { LogHelper } from "./log";
import { MainServer } from "./server";

export class CLI{
    server: MainServer;
    constructor(){
        this.server = new MainServer();
    }

    startServer = () => {
        LogHelper.info("Lancement du server...");
        this.server.start();
    }
}