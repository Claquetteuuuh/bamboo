import { describe, it } from "node:test"
import { expect } from "chai"

import { RSA } from "../../lib/rsa";
const { generateRSAKeys, encrypt, decrypt } = RSA;

export function testRSA() {
    const keys = generateRSAKeys(128)
    const clearMessage = "Hello world !"
    describe("Confirm RSA encryption", () => {
        it('Raises an error on not encrypted', async () => {
            const encryptedMessage = encrypt(clearMessage, keys.publicKey);
            const result = encryptedMessage === clearMessage;
            expect(result).toEqual(false)
        })
        it('Raise error on bad decrypt', async () => {
            const encryptedMessage = encrypt(clearMessage, keys.publicKey);
            const decryptedMessage = decrypt(encryptedMessage, keys.privateKey);
            const result = decryptedMessage === clearMessage;
            expect(result).toEqual(true)
        })
    })
} 