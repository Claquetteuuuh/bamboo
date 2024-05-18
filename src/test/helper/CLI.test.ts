import { CLI } from "../../helper/CLI"
import { describe, it } from "node:test"
import { expect } from "chai"

export function testCLI (){
    const cli = new CLI()
    describe("Confirm answere validator", () => {
        it('Raises an error on "blah"', async () => {
            const result = cli.validateCommand("blah");
            expect(result).equals("Command not found !")
        })
        it('Raise an help on "server"', async () => {
            const result = cli.validateCommand("server");
            expect(result).equals("Usage: \n- server <start|stop|restart>")
        })
    })
}

