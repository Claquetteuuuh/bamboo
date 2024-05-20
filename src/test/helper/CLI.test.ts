import { describe, it } from "node:test"
import { expect } from "chai"

import { CLI } from "../../helper/CLI"
import chalk from "chalk"

export function testCLI (){
    const cli = new CLI()
    describe("Confirm answere validator", () => {
        it('Raises an error on "blah"', async () => {
            const result = cli.validateCommand("blah");
            expect(result).equals("Command not found !")
        })
        it('Raise error on "exit" not work', () => {
            const result = cli.validateCommand("exit");
            expect(result).equals(true)
        })

        // test server commands
        it('Raise an help on "server"', async () => {
            const result = cli.validateCommand("server");
            expect(result).equals("Usage: \n- server <start|stop|restart>")
        })
        it('Raise an help on "server start" not work', async () => {
            const result = cli.validateCommand("server start");
            expect(result).equals(true)
        })
        it('Raise an help on "server stop" not work', async () => {
            const result = cli.validateCommand("server stop");
            expect(result).equals(true)
        })
        it('Raise an help on "server restart" not work', async () => {
            const result = cli.validateCommand("server restart");
            expect(result).equals(true)
        })
        
        it('Raise an help on "ping"', async () => {
            const result = cli.validateCommand("ping");
            expect(result).equals("Usage: \n- ping <CLIENT_NAME>")
        })
       
        it('Raise an error on "ping test" not work', async () => {
            const result = cli.validateCommand("ping test");
            expect(result).equals(true)
        })

        it('Raise an help on "clients"', async () => {
            const result = cli.validateCommand("clients");
            expect(result).equals("Usage: \n- clients <list|focus|unfocus|interact>")
        })
        it('Raise an help on "clients focus"', async () => {
            const result = cli.validateCommand("clients focus");
            expect(result).equals("Usage: \n - clients focus <CLIENT_NAME>")
        })
        it('Raise an error on "clients focus test" not work', async () => {
            const result = cli.validateCommand("clients focus test");
            expect(result).equals(true)
        })
        it('Raise an error on "clients interact" not work', async () => {
            const result = cli.validateCommand("clients interact");
            expect(result).equals(true)
        })

        // test config
        it('Raise an help on "config" not work', () => {
            const result = cli.validateCommand("config");
            expect(result).equals("Usage: \n- config <set|get> <port|debug|rsa_length> <value>")
        })
        it('Raise an help on "config set port" not work', () => {
            const result = cli.validateCommand("config");
            expect(result).equals("Usage: \n- config <set|get> <port|debug|rsa_length> <value>")
        })
        it('Raise an help on "config" not work', () => {
            const result = cli.validateCommand("config");
            expect(result).equals("Usage: \n- config <set|get> <port|debug|rsa_length> <value>")
        })

        // test port
        it('Raise an error on "config get port" not work', () => {
            const result = cli.validateCommand("config get port");
            expect(result).equals(true)
        })
        it('Raise an error on "config set port aaa" work', () => {
            const result = cli.validateCommand("config set port aaa");
            expect(result).equals("Port value should be a number !")
        })
        it('Raise an error on "config set port 123" not work', () => {
            const result = cli.validateCommand("config set port 123");
            expect(result).equals(true)
        })

        // test debug
        it('Raise an error on "config get debug" not work', () => {
            const result = cli.validateCommand("config get debug");
            expect(result).equals(true)
        })
        it('Raise an error on "config set debug aaa" work', () => {
            const result = cli.validateCommand("config set debug aaa");
            expect(result).equals(`Debug value should be ${chalk.underline("true")} or ${chalk.underline("false")}`)
        })
        it('Raise an error on "config set debug true" not work', () => {
            const result = cli.validateCommand("config set debug true");
            expect(result).equals(true)
        })

        // RSA length
        it('Raise an error on "config get rsa_length" not work', () => {
            const result = cli.validateCommand("config get rsa_length");
            expect(result).equals(true)
        })
        it('Raise an error on "config set rsa_length aaa" work', () => {
            const result = cli.validateCommand("config set rsa_length aaa");
            expect(result).equals("RSA length value should be a number !")
        })
        it('Raise an error on "config set rsa_lengh 123" not work', () => {
            const result = cli.validateCommand("config set rsa_length 123");
            expect(result).equals(true)
        })
    })
}

