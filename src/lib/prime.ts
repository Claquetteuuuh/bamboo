
export function generatePrime(bits: number): bigint {
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
}

export function getRandomBigInt(min: bigint, max: bigint): bigint {
    const range = max - min + BigInt(1);
    const bits = range.toString(2).length;
    let randomBigInt: bigint;

    do {
        randomBigInt = BigInt('0b' + [...Array(bits)].map(() => Math.floor(Math.random() * 2)).join(''));
    } while (randomBigInt < min || randomBigInt > max);

    return randomBigInt;
}

export function isProbablePrime(n: bigint, k: number): boolean {
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
}

export function modExp(base: bigint, exp: bigint, mod: bigint): bigint {
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
}