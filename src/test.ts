import EC from 'elliptic';
import { randomBytes } from 'crypto';

const curve = new EC.ec('curve25519');

const aliceKeyPair = curve.genKeyPair();
const alicePublicKey = aliceKeyPair.getPublic();

const bobKeyPair = curve.genKeyPair();
const bobPublicKey = bobKeyPair.getPublic();

const aliceSharedKey = aliceKeyPair.derive(bobPublicKey);

const bobSharedKey = bobKeyPair.derive(alicePublicKey);

console.log('Alice\'s Shared Key:', aliceSharedKey.toString());
console.log('Bob\'s Shared Key:', bobSharedKey.toString());

if (aliceSharedKey.eq(bobSharedKey)) {
    console.log('La clé partagée est identique.');
} else {
    console.log('Erreur dans le calcul des clés partagées.');
}
