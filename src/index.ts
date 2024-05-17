import { Socket, createConnection } from "net";
import { Client } from "./helper/client";

// 

// console.log('Public Key:', keys.publicKey);
// console.log('Private Key:', keys.privateKey);

// const message = "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Beatae expedita consectetur veritatis earum nulla quisquam, facere vero illo aliquam enim corporis, aliquid, vitae dolor architecto sapiente animi. Quaerat laboriosam reiciendis aspernatur cupiditate illo. Magnam, ad laudantium! Minima laboriosam adipisci voluptatem commodi quaerat eum aut culpa ut aliquid similique officiis hic voluptas nisi modi ipsam ipsa, et velit dolorem itaque! Amet eligendi voluptas corporis provident unde nobis quas excepturi magni libero iusto dolore nemo, ipsam facere laudantium iste eveniet officiis nostrum temporibus quo dolorum eum nam ducimus laborum dicta. Similique blanditiis cupiditate itaque aliquid minus placeat. Error eos repellat tempora a!"
// console.log("Claire: ", message)

// const ciphedMessage = encrypt(message, keys.publicKey)
// console.log("Chiffrer: ", ciphedMessage)

// const clearMessage = decrypt(ciphedMessage, keys.privateKey)
// console.log("Dechiffrer: ", clearMessage)


const HOST = '127.0.0.1';
const PORT = 8888;


const client = new Client(HOST, PORT)