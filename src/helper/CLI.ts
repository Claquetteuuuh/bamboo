import { describe, it } from "node:test";
import { config } from "../config/config";
import { LogHelper } from "./log";
import { MainServer } from "./server";
import chalk from "chalk";
import chalkAnimation from "chalk-animation"
import inquirer from "inquirer"
import { createSpinner } from "nanospinner";

const sleep = (ms = config.sleepTime) => new Promise((r) => setTimeout(r, ms))

export class CLI {
    private server?: MainServer;
    constructor() {
        // this.server = new MainServer();
    }

    private startServer = () => {
        const spinner = createSpinner("Starting server...").start()
        if (!this.server) {
            this.server = new MainServer()
            const started = this.server?.start();
            if (started) {
                spinner.success({ text: "Server started successfully !" })
            } else {
                spinner.error({ text: "Cannot start server !" })
            }
        }else{
            spinner.error({ text: "The server is already running !" })
        }
    }

    private closeServer = () => {
        if (this.server) {
            const spinner = createSpinner("Closing server...").start()
            const stopped = this.server.close();
            if (stopped) {
                spinner.success({ text: "Server closed successfully !" })
                return true
            } else {
                spinner.error({ text: "Cannot close server !" })
                return false
            }
        }
        return true

    }

    public startCLI = async () => {
        let welcomText = chalkAnimation.pulse(chalk.green("Welcome to bamboo CLI !"));
        await sleep()
        welcomText.stop();

        this.askCommand()
    }

    public validateCommand = (input: string) => {
        if (/^(exit)$/.test(input)) {
            return true
        } else if (/^(server)(.*)?$/.test(input)) {
            if (/^(server start)$/.test(input)) {
                return true
            } else if (/^(server stop)$/.test(input)) {
                return true
            } else if (/^(server restart)$/.test(input)) {
                return true
            }
            return "Usage: \n- server <start|stop|restart>"
        }
        else {
            return "Command not found !"
        }
    }

    private askCommand = async () => {
        const answers = await inquirer.prompt({
            name: "user_command",
            type: "input",
            message: chalk.green("[Bamboo]$>"),
            validate: this.validateCommand,
        })

        const command = answers.user_command;
        switch (answers.user_command) {
            case "exit":
                const closeServer = this.closeServer()
                if (closeServer) {
                    console.log(chalk.gray("👋 Bye !"))
                    process.exit(0)
                }
                break;
            case "server start":
                this.startServer()
                this.askCommand()
                break;

            default:
                console.log(chalk.gray("Command not implemented !"))
                this.askCommand()
                break;
        }
       
    }
}