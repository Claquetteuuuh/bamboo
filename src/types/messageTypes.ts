export type MessageType = {
    content?: string,
    RSAPublicKey?: { e: string, n: string },
    encrypted?: boolean,
}