import { Socket, createConnection } from "net";
import { RSA } from "../lib/rsa";
import { RSAKeysType, RSAPublicKeyType } from "../types/rsaTypes";
import { MessageType } from "../types/messageTypes";
import { LogHelper } from "./log";
import { config } from "../config/config";

export class Client {
  private socket: Socket;
  private host: string;
  private port: number;
  private keys: RSAKeysType;
  private serverPublicKey?: RSAPublicKeyType;
  private onServerPublicKeyReceived?: () => void;

  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;

    this.socket = this.createSocketConnection();
    this.handleConsoleMessage();
  }

  private createSocketConnection = (): Socket => {
    const socket = createConnection({ host: this.host, port: this.port }, () => {
      LogHelper.info('New client created.');
      LogHelper.info("Generating keys...");
      this.keys = RSA.generateRSAKeys(config.clientRSAPrimeBitLength);
      LogHelper.success("Keys generated successfully");

      const publicKeyMessage = {
        e: this.keys.publicKey.e,
        n: this.keys.publicKey.n
      };
      this.sendPublicKey(publicKeyMessage, socket);
    });

    socket.on('end', () => {
      LogHelper.info('Disconnected from server');
      this.reinitialize();
    });

    socket.on('data', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleServerMessage(message);
      } catch (error) {
        LogHelper.error("Received data is not in JSON format!");
        LogHelper.info('Received from server: ' + data.toString());
      }
    });

    socket.on('error', (err) => {
      LogHelper.error("An error occurred, the server might have closed");
      let timer = setTimeout(() => {
        LogHelper.info("Attempting to reconnect...");
        this.reinitialize(timer);
      }, config.retryConnectionDelay);
    });

    return socket;
  }

  private reinitialize = (timer?: NodeJS.Timeout) => {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.destroy();
    }
    const newClient = new Client(this.host, this.port);
    newClient.onServerPublicKeyReceived = () => {
      this.updateProperties(newClient);
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    };
  }

  private updateProperties = (newClient: Client) => {
    this.socket = newClient.socket;
    this.host = newClient.host;
    this.port = newClient.port;
    this.keys = newClient.keys;
    this.serverPublicKey = newClient.serverPublicKey;
    this.handleConsoleMessage();
  }

  private handleConsoleMessage = () => {
    process.stdin.removeAllListeners('data');
    process.stdin.on('data', (data) => {
      const message = data.toString().trim();
      this.sendMessage(message, this.socket);
    });
  }

  private handleServerMessage = (message: MessageType) => {
    if (message.RSAPublicKey?.e && message.RSAPublicKey?.n) {
      this.serverPublicKey = {
        e: BigInt(message.RSAPublicKey.e),
        n: BigInt(message.RSAPublicKey.n)
      };
      LogHelper.success('Server public key received and stored.');

      if (this.onServerPublicKeyReceived) {
        this.onServerPublicKeyReceived();
      }
    } else if (message.content) {
      const decryptedMessage = message.encrypted
        ? RSA.decrypt(message.content, this.keys.privateKey)
        : message.content;
      LogHelper.info('Received from server: ' + decryptedMessage);
      if(decryptedMessage === "ping"){
        this.sendMessage("pong", this.socket)
      }
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

  public sendMessage = (message: string, socket: Socket) => {
    if (this.serverPublicKey) {
      const encryptedMessage = RSA.encrypt(message, this.serverPublicKey);
      const messageJSON: MessageType = {
        content: encryptedMessage,
        encrypted: true
      };
      if (!socket) {
        LogHelper.error("No connection is established!");
        return;
      }
      socket.write(JSON.stringify(messageJSON));
    } else {
      LogHelper.error("Server public key is not available");
    }
  }
}
