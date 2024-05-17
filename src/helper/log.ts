export const LogHelper = {
    info: (message: string) => {
        console.log("[❔] - ", message)
    },
    success: (message: string) => {
        console.log("[✅] - ", message )
    },
    error: (message: string) => {
        console.log("[❌] - ", message)
    }
}