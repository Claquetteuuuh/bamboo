import { describe, it } from "node:test"
import { expect } from "chai"

import { CLI } from "../../helper/CLI"

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
        it('Raise error on "exit" not work', () => {
            const result = cli.validateCommand("exit");
            expect(result).equals(true)
        })
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
    })
}

