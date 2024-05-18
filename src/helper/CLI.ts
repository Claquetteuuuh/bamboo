import { describe, it } from "node:test";
import { config } from "../config/config";
import { LogHelper } from "./log";
import { MainServer } from "./server";
import chalk from "chalk";
import chalkAnimation from "chalk-animation"
import inquirer from "inquirer"

const sleep = (ms = config.sleepTime) => new Promise((r) => setTimeout(r, ms))

export class CLI{
    server?: MainServer;
    constructor(){
        // this.server = new MainServer();
    }

    startServer = () => {
        LogHelper.info("Lancement du server...");
        this.server.start();
        
    }

    startCLI = async () => {
        const welcomText = chalkAnimation.glitch(chalk.green("Welcome to bamboo CLI !"));
        await sleep()
        welcomText.stop();
    }

    validateCommand = (input: string) => {
        if((/^(server)$/.test(input))){
            return "Usage: \n- server <start|stop|restart>"
        } else{
            return "Command not found !"
        }
    }

    askCommand = async () => {
        const answers = await inquirer.prompt({
            name: "user_command",
            type: "input",
            message: chalk.green("[Bamboo]$>"),
            validate: this.validateCommand,
        })

    }
}