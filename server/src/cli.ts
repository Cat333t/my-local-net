// This is a script to create a custom dev/prod 
import os from "os"
import "dotenv/config"
import path from "path"
import kill from "tree-kill"
import spawn from "cross-spawn";
import readline from "readline";
import { fileURLToPath } from "url";
import { ChildProcess } from "child_process";

const protocol = process.env.HTTPS ? "https" : "http"
const PORT = process.env.APP_PORT ? Number(process.env.APP_PORT) : 80
const HOST = process.env.HOST || "0.0.0.0"
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let isLogging = true

let subProcesses: SubProcess[] = []
let networkAddresses: { server: string[], client: string[] } = {
    server: [], // http://192.168.1.14:81
    client: [] // http://192.168.1.14:80
}

const rl: readline.ReadLine = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    prompt: `\x1b[34m\x1b[1m>\x1b[0m `,
});

type SubProcess = {
    name: string;
    proc: ChildProcess;
    isRunning: boolean;
};

type Command = {
    name: string;
    shortcut?: string | string[];
    description?: string;
    action?: (rl: readline.ReadLine) => void;
};

const commands: Command[] = [
    {
        name: "exit",
        shortcut: ["q", "e"],
        description: "Exit the program",
        action: () => {
            killHandler(subProcesses);
        },
    },
    {
        name: "clear",
        shortcut: "c",
        description: "Clear the console",
        action: () => {
            console.clear();
        },
    },
    {
        name: "help",
        shortcut: "h",
        description: "Show help",
        action: () => {
            show.log("📖 Available commands:", true);
            show.log(`\x1b[33m   ${"Shortcut".padEnd(9, " ")} | ${"Command".padEnd(15, " ")} | ${"Description"}\x1b[0m`, true);
            for (const cmd of commands) {
                const shortcutStr = typeof cmd.shortcut === "string" ? cmd.shortcut : Array.isArray(cmd.shortcut) ? cmd.shortcut.join(", ") : "";
                show.log(`   ${shortcutStr.padEnd(9, " ") || "   "} | ${cmd.name.padEnd(15, " ") || " ".padEnd(15, " ")} | ${cmd.description || ""}`, true);
            }
        },
    },
    {
        name: "network",
        shortcut: "n",
        description: "Show network interfaces",
        action: () => {
            showNetworkInterfaces();
        },
    },
    {
        name: "status",
        shortcut: "s",
        description: "Show status",
        action: () => {
            if (!subProcesses.length) {
                show.log("ℹ️  No process was started yet", true);
                return;
            }

            for (const { name, proc, isRunning } of subProcesses) {
                if (!proc) continue

                const ip = name === "SERVER" ? networkAddresses.server[0] : name === "CLIENT" ? networkAddresses.client[0] : undefined;

                show.log("━".repeat(process.stdout.columns / 2), true);
                show.log(`${'Process name'.padEnd(20, " ")}: ${name}`, true);
                show.log(`${'Process PID'.padEnd(20, " ")}: ${proc.pid || "(not available)"}`, true);
                show.log(`${'Is running'.padEnd(20, " ")}: ${isRunning ? "YES 🟢" : "NO 🔴"}`, true);
                show.log(`${'Exit code'.padEnd(20, " ")}: ${proc.exitCode || "(not available)"}`, true);
                show.log(`${'Exit signal'.padEnd(20, " ")}: ${proc.signalCode || "(not available)"}`, true);
                show.log(`${'Link'.padEnd(20, " ")}: ${ip}`, true);
                
                //если последний процесс
                if (subProcesses[subProcesses.length - 1]?.proc === proc) {
                    show.log("━".repeat(process.stdout.columns / 2), true);
                }
            }
        }
    },
    {
        name: "info",
        shortcut: "i", 
        description: "Show info",
        action: () => {
            show.log(`📝 Mode: ${process.env.NODE_ENV || "development"}`, true);
            show.log(`🌐 Protocol: ${protocol}`, true);
            show.log(`🏗️  Port app: ${PORT}`, true);
            show.log(`💻 Port server: ${process.env.SERVER_PORT}`, true);
        }
    },
    {
        name: "log",
        shortcut: "l",
        description: "Stop/start logging",
        action: () => {
            isLogging = !isLogging;
            show.log(`Logging is ${isLogging ? "enabled" : "disabled"}. Use "log" to toggle.`, true);
            if (!isLogging) {
                show.log("\x1b[31mWARNING: All logs will not be displayed (not including immediate logs)\x1b[0m", true);
            }
        }
    },
    {
        name: "restart",
        shortcut: "r",
        description: "Restart the server",
        action: () => {
            killHandler(subProcesses, false);
            runApp();
        }
    },
    {
        name: "stop",
        shortcut: "k",
        description: "Stop the server",
        action: () => {
            killHandler(subProcesses, false);
        }
    }
];

const show = {
    log: (msg?: any, immediate = false): void => {
        if (!isLogging && !immediate) return;

        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);

        console.log(msg);

        rl.prompt(true);
    },
    error: (msg?: any, immediate: boolean = false): void => {
        show.log(`\x1b[31m${msg}\x1b[0m`, immediate);
    }
}

function killHandler(proc: null | string | ChildProcess | ChildProcess[] | SubProcess[], quit: boolean = true) {
    if (proc) {
        if (Array.isArray(proc)) {
            for (const p of proc) {
                if ('proc' in p) {
                    killProcessTree(p.proc.pid);
                    p.isRunning = false;
                } else {
                    killProcessTree(p.pid);
                }
            }
        } else if (typeof proc === "string") { // SERVER/CLIENT
            const subprocess = subProcesses.find(p => p.name === proc);
            if (subprocess) {
                killProcessTree(subprocess.proc.pid);
                subprocess.isRunning = false;
            }
        } else {
            killProcessTree(proc.pid);
        }
    }

    function killProcessTree(pid: number | null | undefined) {
        if (pid !== null && pid !== undefined) {
            try {
                kill(pid, "SIGKILL");
            } catch (e) {
                show.error(`Error killing process ${pid}: ${e}`, true);
            }
        }
    }
    if (quit) {
        rl.close();
        process.exit(0);
    }
}

async function enableCommands() {
    show.log(`\x1b[33m\n📝 Use "help" for available commands.\x1b[0m`);

    rl.prompt(true);
    rl.on("line", (input) => {
        input = input.trim().toLowerCase();
        const command = commands.find((c) => c.shortcut === input || c.name === input || Array.isArray(c.shortcut) && c.shortcut.includes(input));
        if (command) {
            command.action?.(rl);
        } else if (input) {
            const shortInput = input.length > 20 ? `${input.slice(0, 17)}...${input.slice(-3)}` : input;
            show.error(`Unknown command: "${shortInput}". Use "help" for available commands.`, true);
        }
        rl.prompt(true);
    });
}

function showNetworkInterfaces() {
    const isDefaultPort = (port: number | string): boolean => {
        return (protocol === "http" && Number(port) === 80) ||
        (protocol === "https" && Number(port) === 443)
            ? true
            : false
    }
        
    const url = (ip: string, port: number | string = PORT) => `${protocol}://${ip}${isDefaultPort(port) ? "" : `:${port}`}`

    show.log("🌐 Network interfaces:", true);

    show.log(`   ➜ Local:    ${url("localhost")}`, true);

    if (HOST === "0.0.0.0") {
        const networkInterfaces = os.networkInterfaces(); 
        for (const networkInterface of Object.values(networkInterfaces)) {
            if (!networkInterface) continue;
            for (const address of networkInterface) {
                if (address.family === 'IPv4' && address.internal === false) {
                    show.log(`   ➜ Network:  ${url(address.address)}`, true);
                    networkAddresses.client.push(url(address.address));   
                    networkAddresses.server.push(url(address.address, Number(process.env.SERVER_PORT || 81)));                 
                }
            }
        }
        if (os.hostname()) {
            show.log(`   ➜ Hostname: ${url(os.hostname())}`, true);
        }
    } else {
        networkAddresses.client.push(url("localhost"));
    }
}

function init() {
    console.clear()

    show.log("\x1b[32m\n🚀 Welcome to My Local Net 🚀 \n\x1b[0m");

    runApp();
    showNetworkInterfaces();
    enableCommands();

    rl.on("SIGINT", () => {
        console.log("\n🔹 Exiting...");
        killHandler(subProcesses, true);
    });

    process.on("SIGINT", () => {
        console.log("\n🔹 Exiting...");
        killHandler(subProcesses, true);
    });
}

function runApp() {
    subProcesses.forEach((p) => {
        if (!p.proc.killed && p.proc.exitCode === null) {
            killHandler(p.proc, false);
        }
    });

    function startProcess(name: string, filter: string) {
        const index = subProcesses.findIndex(p => p.name === name);

        const proc = runScript(
            "pnpm",
            ["--filter", filter, "dev"],
            path.resolve(__dirname, "../.."),
            name
        );

        if (index !== -1 && subProcesses[index]) {
            subProcesses[index].proc = proc;
        } else {
            subProcesses.push({ name, proc, isRunning: true });
        }
    }

    try {
        show.log(`🚀 Server is running...`, true)
        startProcess("SERVER", "server");

        // clear line
        if (process.stdout.isTTY) {
            readline.moveCursor(process.stdout, 0, -1);
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);
        }

        show.log(`🚀 Server is running`, true)

        show.log(`🌐 Running client...`, true)
        startProcess("CLIENT", "client");

        // clear line
        if (process.stdout.isTTY) {
            readline.moveCursor(process.stdout, 0, -1);
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);
        }

        show.log(`🌐 Client is running`, true)
    } catch (e) {
        show.error(e);
        return false;
    }
}

function runScript(command: string, args: string[], cwd?: string, name: string | null = null) {
    const proc = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"], cwd });
    
    proc.stderr?.on("data", (data: any) => {
        show.error(data.toString(), true);
    });
    
    proc.on("error", (error: any) => {
        show.error(`Error running ${command}: ${error.message}`);
    });
    
    proc.on("exit", (code: number, signal: string) => {
        if (signal) {
            show.log(`${name || command} killed by ${signal}`, true);
        } else {
            show.log(`${name || command} exited with code ${code}`, true);
        }
        subProcesses.forEach(p => {
            if (p.proc === proc) {
                p.isRunning = false;
            }
        });
    });

    return proc;
}

if (import.meta.url === `file://${process.argv[1]}`) {
    init();
}