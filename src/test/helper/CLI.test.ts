import { describe, it } from "node:test"
import { expect } from "chai"

import { CLI } from "../../helper/CLI"
import chalk from "chalk"

export function testCLI (){
    const cli = new CLI()
    describe("Confirm answere validator", () => {
        let command: string;
        command = "blah"
        it(`Raises an error on "${command}"`, async () => {
            const result = cli.validateCommand(command);
            expect(result).equals("Command not found !")
        })

        command = "exit"
        it(`Raise error on "${command}" not work`, () => {
            const result = cli.validateCommand(command);
            expect(result).equals(true)
        })

        // test server commands
        command = "server"
        it(`Raise an help on "${command}"`, async () => {
            const result = cli.validateCommand(command);
            expect(result).equals("Usage: \n- server <start|stop|restart>")
        })
        command = "server start"
        it(`Raise an help on "${command}" not work`, async () => {
            const result = cli.validateCommand(command);
            expect(result).equals(true)
        })
        command = "server stop"
        it(`Raise an help on "${command}" not work`, async () => {
            const result = cli.validateCommand(command);
            expect(result).equals(true)
        })
        command = "server restart"
        it(`Raise an help on "${command}" not work`, async () => {
            const result = cli.validateCommand(command);
            expect(result).equals(true)
        })

        // test config
        command = "config"
        it(`Raise an help on "${command}" not work`, () => {
            const result = cli.validateCommand(command);
            expect(result).equals("Usage: \n- config <set|get> <port|debug|rsa_length> <value>")
        })
        command = "config set port"
        it(`Raise an help on "${command}" not work`, () => {
            const result = cli.validateCommand(command);
            expect(result).equals("Usage: \n- config <set|get> <port|debug|rsa_length> <value>")
        })
        command = "config"
        it(`Raise an help on "${command}" not work`, () => {
            const result = cli.validateCommand(command);
            expect(result).equals("Usage: \n- config <set|get> <port|debug|rsa_length> <value>")
        })

        // test port
        command = "config get port"
        it(`Raise an error on "${command}" not work`, () => {
            const result = cli.validateCommand(command);
            expect(result).equals(true)
        })
        command = "config set port aaa"
        it(`Raise an error on "${command}"`, () => {
            const result = cli.validateCommand(command);
            expect(result).equals("Port value should be a number !")
        })
        command = "config set port 123"
        it(`Raise an error on "${command}" not work`, () => {
            const result = cli.validateCommand(command);
            expect(result).equals(true)
        })

        // test config
        command = "config get debug"
        it(`Raise an error on "${command}" not work`, () => {
            const result = cli.validateCommand(command);
            expect(result).equals(true)
        })
        command = "config set debug aaa"
        it(`Raise an error on "${command}"`, () => {
            const result = cli.validateCommand(command);
            expect(result).equals(`Debug value should be ${chalk.underline("true")} or ${chalk.underline("false")}`)
        })
        command = "config set debug true"
        it(`Raise an error on "${command}" not work`, () => {
            const result = cli.validateCommand(command);
            expect(result).equals(true)
        })
    })
}

