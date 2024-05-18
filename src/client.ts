import { Client } from "./helper/client";
import { config } from "./config/config";

const HOST = '127.0.0.1';
const client = new Client(HOST, config.serverPort)