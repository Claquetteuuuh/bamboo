import { config } from "../config/config";
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
        } else {
            spinner.error({ text: "The server is already running !" })
        }
    }

    private closeServer = () => {
        const spinner = createSpinner("Closing server...").start()
        if (this.server) {
            const stopped = this.server.close();
            if (stopped) {
                spinner.success({ text: "Server closed successfully !" })
                this.server = undefined
                return true
            } else {
                spinner.error({ text: "Cannot close server !" })
                return false
            }
        } else {
            spinner.success({ text: "Server closed successfully !" })
            return true
        }
    }

    private restartServer = () => {
        const spinner = createSpinner("Restarting server...").start()
        if (this.server) {
            const stopped = this.server.restart();
            if (stopped) {
                spinner.success({ text: "Server restarted successfully !" })
                return true
            } else {
                spinner.error({ text: "Cannot restart server !" })
                return false
            }
        } else {
            spinner.success({ text: "Server restarted successfully !" })
            return true
        }
    }


    private setServerPort = (port: number) => {
        const spinner = createSpinner("Changing port...").start()
        if (this.server) {
            config.serverPort = port;
            this.server.setPort(port)
            const stopped = this.server.restart();
            if (stopped) {
                spinner.success({ text: "Port changed successfully !" })
                return true
            } else {
                spinner.error({ text: "Cannot restart server !" })
                return false
            }
        } else {
            spinner.error({ text: "The server is not running !" })
            return true
        }
    }

    private getServerPort = (): number => {
        return this.server.getPort();
    }

    private setDebugMode = (value: boolean) => {
        config.debugMode = value;
    }

    private getDebugMode = (): boolean => {
        return config.debugMode;
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
        } else if (/^(config)(.*)?$/.test(input)) {
            // port config
            if (/^(config set port)(.*)$/.test(input)) {
                if (/^(config set port) ([0-9]{1,})$/.test(input)) {
                    return true
                }
                return "Port value should be a number !"
            } else if (/^(config get port)$/.test(input)) {
                return true
            }

            else if (/^(config get debug)$/.test(input)) {
                return true
            } else if (/^(config set debug(.*)?)$/.test(input)) {
                if (/^(config set debug (true|false)?)$/.test(input)) {
                    return true
                }
                return `Debug value should be ${chalk.underline("true")} or ${chalk.underline("false")}`
            }
            return "Usage: \n- config <set|get> <port|debug|rsa_length> <value>"
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

        const command: string = answers.user_command;
        switch (command) {
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

            case "server stop":
                this.closeServer()
                this.askCommand()
                break;

            case "server start":
                this.startServer()
                this.askCommand()
                break;

            case "server restart":
                this.restartServer()
                this.askCommand()
                break;

            case command.match(/^(config set port) ([0-9])*$/)?.input:
                const port = command.split(" ")[3]
                try {
                    const portNumber = Number.parseInt(port)
                    this.setServerPort(portNumber)
                } catch (err) {
                    console.log(chalk.red("Port value should be a number !"))
                }
                this.askCommand()
                break;

            case command.match(/^(config get port)$/)?.input:
                console.log(chalk.green(`Server is running on port: ${this.getServerPort()}`))
                this.askCommand()
                break;

            case command.match(/^(config set debug (true|false)?)$/)?.input:
                const debug = command.split(" ")[3]
                this.setDebugMode(debug === "true" ? true : false)
                this.askCommand()
                break;

            case command.match(/^(config get debug)$/)?.input:
                const currentDebugModeValue = this.getDebugMode()
                if (currentDebugModeValue) {
                    console.log("Debug mode is enabled !")
                } else {
                    console.log("Debug mode is disabled !")
                }
                this.askCommand()
                break;

            default:
                console.log(chalk.gray("Command not implemented !"))
                this.askCommand()
                break;
        }

    }
}