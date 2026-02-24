import { fileURLToPath } from "url";
import express from "express";
import https from "https";
import http from "http";
import cors from "cors";
import path from "path";
import "dotenv/config";
import os from "os";

import api from "./api/routes.js";
import { createHttpsRedirectServer } from "./redirect.js";

const appPort = process.env.APP_PORT ? Number(process.env.APP_PORT) : 1337;
const PORT = process.env.SERVER_PORT
	? process.env.NODE_ENV === "production" ? appPort : Number(process.env.SERVER_PORT)
	: 1338;

const HOST = process.env.HOST || "localhost";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const clientPath = path.resolve(__dirname, "../../", "client");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use(cors({
	origin: process.env.ALLOWED_HOSTS?.split(',').map((host) => host.trim()) || [],
	methods: ["GET", "POST", "PATCH"]
}));

app.use("/api", api);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.resolve(clientPath, "dist")));
	app.get("/{*splat}", (req, res) => {
		res.sendFile(path.resolve(clientPath, "dist", "index.html"));
	});

	app.use((req, res) => {
		if (req.headers.accept?.includes("text/html")) { // if from browser
			res.status(500).send("Server Error. Could not find route. Please try again.");
		} else {
			res.status(500).json({ message: "Server Error. Could not find route. Please try again." });
		}
	});
}

const server: http.Server = process.env.HTTPS
  ? https.createServer(app)
  : http.createServer(app);

server.listen(PORT, HOST, afterServerStart);
	
function afterServerStart() {
	const protocol = process.env.HTTPS ? "https" : "http"

	if (process.env.HTTPS && PORT === 443) {
		createHttpsRedirectServer();
		console.log("🏎️ Redirecting to https");
	}

	const isDefaultPort = (port: number | string): boolean => {
		return (protocol === "http" && Number(port) === 80) ||
		(protocol === "https" && Number(port) === 443)
			? true
			: false
	}
		
	const url = (ip: string, port: number | string = PORT) => `${protocol}://${ip}${isDefaultPort(port) ? "" : `:${port}`}`

	console.log("🌐 Network interfaces:");

	console.log(`   ➜ Local:    ${url("localhost")}`);

	const networkInterfaces = os.networkInterfaces(); 
	for (const networkInterface of Object.values(networkInterfaces)) {
		if (!networkInterface) continue;
		for (const address of networkInterface) {
			if (address.family === 'IPv4' && address.internal === false) {
				console.log(`   ➜ Network:  ${url(address.address)}`);
			}
		}
	}
	if (os.hostname()) {
		console.log(`   ➜ Hostname: ${url(os.hostname())}`);
	}
}