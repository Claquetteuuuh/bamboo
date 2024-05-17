import { Socket, createConnection } from "net";
import { RSA } from "../lib/rsa";
import { RSAKeysType } from "../types/rsaTypes";
import { messageType } from "../types/messageTypes";
import { LogHelper } from "./log";
import { config } from "../config/config";

export class Client {
  socket: Socket;
  host: string;
  port: number;
  keys: RSAKeysType;

  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;

    this.socket = this.createSocketConnection();
  }

  createSocketConnection(): Socket {
    const socket = createConnection({ host: this.host, port: this.port }, () => {
      LogHelper.info('New client created.')

      LogHelper.info("Génération des clés...")
      this.keys = RSA.generateRSAKeys(1024);
      LogHelper.success("Clé généré avec succès")

      // Send the client's public key to the server
      const publicKeyMessage = JSON.stringify({
        e: this.keys.publicKey.e.toString(),
        n: this.keys.publicKey.n.toString()
      });
      socket.write(publicKeyMessage);

      process.stdin.on('data', (data) => {
        const messageJSON: messageType = {
          content: data.toString(),
          encrypted: false
        }
        socket.write(JSON.stringify(messageJSON));
      });
    });

    socket.on('end', () => {
      LogHelper.info('Disconnected from server')
      this.reinitialize();
    });

    socket.on('data', (data) => {
      LogHelper.info('Received from server: ' + data.toString())
    });

    socket.on('error', (err) => {
      LogHelper.error("Une erreur s'est produite, le serveur à dû être fermé")
      let timer = setTimeout(() => {
        LogHelper.info("Tentative de reconnection...")
        this.reinitialize(timer);
      }, config.retryConnectionDelay);
    });

    return socket;
  }

  reinitialize(timer?: NodeJS.Timeout) {
    const newClient = new Client(this.host, this.port);
    this.updateProperties(newClient);
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
  }

  updateProperties(newClient: Client) {
    this.socket = newClient.socket;
    this.host = newClient.host;
    this.port = newClient.port;
    this.keys = newClient.keys;
  }
}
