import { Server, Socket, createServer } from "net";
import { RSA } from "../lib/rsa";
import { RSAKeysType, RSAPublicKeyType } from "../types/rsaTypes";
import { MessageType } from "../types/messageTypes";
import { LogHelper } from "./log";
import { config } from "../config/config";
const { generateRSAKeys } = RSA;

export class MainServer {
    RSAKeys: RSAKeysType;
    clients: { socket: Socket, publicKey: RSAPublicKeyType }[];
    server: Server;
    port: number;

    constructor(clients: { socket: Socket, publicKey: RSAPublicKeyType }[] = [], port: number = config.serverPort) {
        this.clients = clients;
        this.port = port;

        this.RSAKeys = generateRSAKeys(config.serverRSAPrimeBitLength);

        this.server = createServer((sock: Socket) => this.onClientConnection(sock));
        this.handleConsoleMessage();
    }

    onClientConnection(sock: Socket) {
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
            this.clients = this.clients.filter(client => client.socket !== sock);
        });

        sock.on('error', (error) => {
            LogHelper.error(`${sock.remoteAddress}:${sock.remotePort} Connection Error ${error}`);
        });
    }

    start() {
        this.server.listen(this.port, () => {
            LogHelper.info(`Server started on port ${this.port}`);
        });
    }

    handleClientMessage(message: MessageType, sock: Socket) {
        if (message.RSAPublicKey?.e && message.RSAPublicKey?.n) {
            const publicKey = {
                e: BigInt(message.RSAPublicKey?.e),
                n: BigInt(message.RSAPublicKey?.n)
            };
            this.clients.push({ socket: sock, publicKey: publicKey });
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

    sendPublicKey(key: RSAPublicKeyType, socket: Socket) {
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

    sendMessage(message: string, clientSocket: Socket) {
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
            LogHelper.error("Client public key is not available");
        }
    }

    handleConsoleMessage() {
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
}
