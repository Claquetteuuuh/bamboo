import { config } from "../config/config"

export const LogHelper = {
    info: (message: string) => {
        config.debugMode? console.log("\n[❔] - ", message): false
    },
    success: (message: string) => {
        config.debugMode? console.log("\n[✅] - ", message ): false
    },
    error: (message: string) => {
        config.debugMode? console.log("\n[❌] - ", message): false
    }
}