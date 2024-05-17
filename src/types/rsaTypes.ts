export type RSAKeysType = {
    privateKey: RSAPrivateKeyType
    publicKey: RSAPublicKeyType
}

export type RSAPublicKeyType = {
    e: bigint, 
    n: bigint 
} 
export type RSAPrivateKeyType = {
    d: bigint, 
    n: bigint 
} 