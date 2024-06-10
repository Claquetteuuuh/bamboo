import { Client } from "./helper/client";
import { config } from "./config/config";

const HOST = config.serverIP;
const client = new Client(HOST, config.serverPort)