import { RSAKeysType } from "../types/rsaTypes";
import { generatePrime, getRandomBigInt, isProbablePrime, modExp } from "./prime";

export const RSA = {

    generateRSAKeys: (bits: number): RSAKeysType => {
        // Step 1: Generate two large primes p and q
        const p = generatePrime(bits / 2);
        const q = generatePrime(bits / 2);

        // Step 2: Compute n = p * q
        const n = p * q;

        // Step 3: Compute φ(n) = (p - 1) * (q - 1)
        const phi = (p - BigInt(1)) * (q - BigInt(1));

        // Step 4: Choose e such that 1 < e < φ(n) and gcd(e, φ(n)) = 1
        let e = BigInt(65537); // Common choice for e
        if (RSA.gcd(e, phi) !== BigInt(1)) {
            throw new Error('e and φ(n) are not coprime');
        }

        // Step 5: Compute d such that d ≡ e^(-1) (mod φ(n))
        const d = RSA.modInverse(e, phi);

        return {
            publicKey: { e, n },
            privateKey: { d, n }
        };
    },

    gcd: (a: bigint, b: bigint): bigint => {
        while (b !== BigInt(0)) {
            [a, b] = [b, a % b];
        }
        return a;
    },

    modInverse: (a: bigint, m: bigint): bigint => {
        let [m0, x0, x1] = [m, BigInt(0), BigInt(1)];

        if (m === BigInt(1)) {
            return BigInt(0);
        }

        while (a > BigInt(1)) {
            const q = a / m;
            [m, a] = [a % m, m];
            [x0, x1] = [x1 - q * x0, x0];
        }

        if (x1 < BigInt(0)) {
            x1 += m0;
        }

        return x1;
    },

    // Functions from the previous implementation
    generatePrime: (bits: number): bigint => {
        if (bits < 2) {
            throw new Error('Number of bits must be at least 2');
        }

        const min = BigInt(1) << BigInt(bits - 1); // Minimum value with the specified bits
        const max = (BigInt(1) << BigInt(bits)) - BigInt(1); // Maximum value with the specified bits

        while (true) {
            const candidate = getRandomBigInt(min, max);
            if (isProbablePrime(candidate, 20)) { // Using Miller-Rabin test with 20 iterations
                return candidate;
            }
        }
    },

    getRandomBigInt: (min: bigint, max: bigint): bigint => {
        const range = max - min + BigInt(1);
        const bits = range.toString(2).length;
        let randomBigInt: bigint;

        do {
            randomBigInt = BigInt('0b' + [...Array(bits)].map(() => Math.floor(Math.random() * 2)).join(''));
        } while (randomBigInt < min || randomBigInt > max);

        return randomBigInt;
    },

    isProbablePrime: (n: bigint, k: number): boolean => {
        if (n < BigInt(2)) return false;
        if (n % BigInt(2) === BigInt(0)) return n === BigInt(2);

        let s = 0n;
        let d = n - 1n;
        while (d % 2n === 0n) {
            d /= 2n;
            s += 1n;
        }

        outerLoop: for (let i = 0; i < k; i++) {
            const a = getRandomBigInt(BigInt(2), n - BigInt(2));
            let x = modExp(a, d, n);
            if (x === BigInt(1) || x === n - BigInt(1)) continue;

            for (let r = 1n; r < s; r++) {
                x = modExp(x, BigInt(2), n);
                if (x === BigInt(1)) return false;
                if (x === n - BigInt(1)) continue outerLoop;
            }

            return false;
        }

        return true;
    },

    modExp: (base: bigint, exp: bigint, mod: bigint): bigint => {
        let result = BigInt(1);
        base = base % mod;

        while (exp > 0) {
            if (exp % BigInt(2) === BigInt(1)) {
                result = (result * base) % mod;
            }
            exp = exp >> BigInt(1);
            base = (base * base) % mod;
        }

        return result;
    },

    encrypt: (message: string, publicKey: { e: bigint, n: bigint }): string => {
        const { e, n } = publicKey;
        const messageBytes = Buffer.from(message, 'utf8');
        const messageBigInts = Array.from(messageBytes).map(byte => BigInt(byte));
    
        const encryptedBigInts = messageBigInts.map(m => modExp(m, e, n));
        const encryptedBytes = Buffer.concat(encryptedBigInts.map(b => RSA.bigintToBuffer(b, n)));
        
        return encryptedBytes.toString('base64');
    },

    decrypt: (encryptedMessage: string, privateKey: { d: bigint, n: bigint }): string => {
        const { d, n } = privateKey;
    const encryptedBytes = Buffer.from(encryptedMessage, 'base64');

    const chunkSize = Math.ceil(n.toString(2).length / 8);
    const encryptedBigInts = [];
    for (let i = 0; i < encryptedBytes.length; i += chunkSize) {
        const chunk = encryptedBytes.slice(i, i + chunkSize);
        encryptedBigInts.push(RSA.bufferToBigint(chunk));
    }

    const decryptedBigInts = encryptedBigInts.map(c => modExp(c, d, n));
    const decryptedBytes = Buffer.from(decryptedBigInts.map(b => Number(b)));

    return decryptedBytes.toString('utf8');
    },

    bigintToBuffer: (bigint: bigint, n: bigint): Buffer => {
        const hex = bigint.toString(16);
        const pad = n.toString(16).length - hex.length;
        return Buffer.from('0'.repeat(pad) + hex, 'hex');
    },

    bufferToBigint: (buffer: Buffer): bigint => {
        return BigInt('0x' + buffer.toString('hex'));
    }
    
}
