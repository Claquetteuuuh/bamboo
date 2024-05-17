import { Server, Socket, createServer } from "net";
import { RSA } from "../lib/rsa";
import { RSAKeysType, RSAPublicKeyType } from "../types/rsaTypes";
import { messageType } from "../types/messageTypes";
import { LogHelper } from "./log";
const { generateRSAKeys } = RSA;

export class MainServer {
    RSAKeys: RSAKeysType;
    clients: { socket: Socket, publicKey: RSAPublicKeyType }[];
    server: Server;
    port: number;
    constructor(clients: { socket: Socket, publicKey: RSAPublicKeyType }[] = [], port: number = 8888) {
        this.clients = clients;
        this.port = port;

        this.RSAKeys = generateRSAKeys(1024);

        this.server = createServer((sock: Socket) => this.onClientConnection(sock));
    }

    onClientConnection(sock: Socket) {
        LogHelper.success(`${sock.remoteAddress}:${sock.remotePort} Connected`)

        sock.on('data', (data) => {
            const message = data.toString();
            try {
                const clientPublicKey = JSON.parse(message);
                if (clientPublicKey.e && clientPublicKey.n) {
                    // Convert the string values back to BigInt
                    const publicKey = {
                        e: BigInt(clientPublicKey.e),
                        n: BigInt(clientPublicKey.n)
                    };
                    this.clients.push({ socket: sock, publicKey: publicKey });
                    LogHelper.success('Client public key received and stored.')
                    sock.write('Public key received by the server.');

                    LogHelper.info(clientPublicKey)
                }
                else {
                    // toutes autres connexion
                    const messageJSON: messageType = JSON.parse(message);
                    if (!messageJSON.encrypted) {
                        LogHelper.info(`>> data received : ${messageJSON.content}`)
                        let serverResp = "Hello from the server";
                        sock.write(serverResp);
                    }
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        });

        sock.on('close', () => {
            LogHelper.info(`${sock.remoteAddress}:${sock.remotePort} Connection closed`)
        });

        sock.on('error', (error) => {
            LogHelper.error(`${sock.remoteAddress}:${sock.remotePort} Connection Error ${error}`)
        });
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Server started on port ${this.port}`);
        });
    }
}
