import { Server, Socket, createServer } from "net";
import { RSA } from "../lib/rsa";
import { RSAKeysType, RSAPublicKeyType } from "../types/rsaTypes";
import { MessageType } from "../types/messageTypes";
import { LogHelper } from "./log";
import { config } from "../config/config";
const { generateRSAKeys } = RSA;

type ClientType = { socket: Socket, publicKey: RSAPublicKeyType }

export class MainServer {
    public RSAKeys: RSAKeysType;
    private clients: ClientType[];
    private server: Server;
    private port: number;
    private focusedClient: ClientType;

    constructor(clients: ClientType[] = [], port: number = config.serverPort) {
        this.clients = clients;
        this.port = port;

        this.RSAKeys = generateRSAKeys(config.serverRSAPrimeBitLength);

        this.server = createServer((sock: Socket) => this.onClientConnection(sock));
        // this.handleConsoleMessage();
    }

    private onClientConnection = (sock: Socket) => {
        LogHelper.success(`${sock.remoteAddress}:${sock.remotePort} Connected`);

        sock.on('data', (data) => {
            const message = data.toString();
            try {
                const receivedMessage = JSON.parse(message);
                this.handleClientMessage(receivedMessage, sock);
            } catch (error) {
                LogHelper.error("The received info is not in JSON format!");
            }
        });

        sock.on('close', () => {
            LogHelper.info(`${sock.remoteAddress}:${sock.remotePort} Connection closed`);
            this.removeClient(sock)
        });

        sock.on('error', (error) => {
            LogHelper.error(`${sock.remoteAddress}:${sock.remotePort} Connection Error ${error}`);
        });
    }

    public start = (): boolean => {
        try{
            this.server.listen(this.port, () => {
                LogHelper.info(`Server started on port ${this.port}`);
            });
            return true
        }catch(err){
            return false
        }
    }

    private handleClientMessage = (message: MessageType, sock: Socket) => {
        if (message.RSAPublicKey?.e && message.RSAPublicKey?.n) {
            const publicKey = {
                e: BigInt(message.RSAPublicKey?.e),
                n: BigInt(message.RSAPublicKey?.n)
            };
            this.addClient(sock, publicKey);
            LogHelper.success('Client public key received and stored.');
            this.sendPublicKey(this.RSAKeys.publicKey, sock);
        } else {
            let clearMessage: string;
            if (!message.encrypted) {
                clearMessage = message.content;
                // this.sendMessage(`Non encrypted data received!`, sock);
            } else {
                clearMessage = RSA.decrypt(message.content, this.RSAKeys.privateKey);
                // this.sendMessage(`Encrypted data received!`, sock);
            }
            LogHelper.info(`>> data received: ${clearMessage}`);
        }
    }

    private sendPublicKey = (key: RSAPublicKeyType, socket: Socket) => {
        const publicKeyMessage = {
            e: key.e.toString(),
            n: key.n.toString()
        };
        const message: MessageType = {
            RSAPublicKey: publicKeyMessage,
            encrypted: false,
        };
        const sendedMessage = JSON.stringify(message);
        socket.write(sendedMessage);
    }

    private sendMessage = (message: string, clientSocket: Socket) => {
        const client = this.clients.find(c => c.socket === clientSocket);
        if (client) {
            const encryptedMessage = RSA.encrypt(message, client.publicKey);
            const messageJSON: MessageType = {
                content: encryptedMessage,
                encrypted: true
            };
            if (!clientSocket) {
                LogHelper.error("No connection is established!");
                return;
            }
            clientSocket.write(JSON.stringify(messageJSON));
        } else {
            LogHelper.error("Client is not found");
        }
    }

    public sendMessageToFocused = (message: string) => {
        this.sendMessage(message, this.getFocusedClient().socket)
    }

    private handleConsoleMessage = () => {
        // TODO gerer a quel client on envois le message
        process.stdin.on('data', (data) => {
            const message = data.toString().trim();
            if (this.clients.length > 0) {
                this.sendMessage(message, this.clients[0].socket); // envois au premier
            } else {
                LogHelper.error("No clients are connected.");
            }
        });
    }

    private updateProperties = (newServer: MainServer) => {
        this.RSAKeys = newServer.RSAKeys;
        this.clients = [];
        this.server = newServer.server;
        this.port = newServer.port;
        this.focusedClient = newServer.focusedClient;
    }

    public close = (): boolean => {
        try{
            for (let i = 0; i < this.clients.length; i++) {
                const client = this.clients[i];
                client.socket.end();
            }
            this.server.close(() => {
                LogHelper.success('Server closed successfully ');
                return true;
            })
            return true
            
        }catch(err) {
            return false;
        }
    }

    public restart = () => {
        try{
            for (let i = 0; i < this.clients.length; i++) {
                const client = this.clients[i];
                client.socket.end();
            }
            this.server.close(() => {
                LogHelper.info('Server is restarting...');
                const newServer = new MainServer(this.clients, this.port);
                newServer.start();
                this.updateProperties(newServer);
                LogHelper.success('Server restarted successfully !')
                return true
            })
            return true
        }catch(err){
            return false
        }
    }
    getClients = (): ClientType[] => {
        return this.clients
    }

    removeClient = (socket: Socket) => {
        this.clients = this.clients.filter(client => client.socket !== socket);
    }

    addClient = (socket: Socket, publicKey: RSAPublicKeyType) => {
        this.clients.push({ socket: socket, publicKey: publicKey });
    }

    setFocusedClient = (socket: Socket) => {
        this.focusedClient = this.clients.find(client => client.socket === socket);
    }

    getFocusedClient = (): ClientType => {
        return this.focusedClient;
    }

    setPort = (port: number) => {
        this.port = port;
    }

    getPort = (): number => {
        return this.port;
    } 
}
