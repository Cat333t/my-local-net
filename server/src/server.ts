import express from "express";
import https from "https";
import cors from "cors";
import path from "path";
import "dotenv/config";

import api from "./api/routes.js";
import { createHttpsRedirectServer } from "./redirect.js";

const PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 81;
const HOST = process.env.HOST || "0.0.0.0";

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
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(clientPath, "dist", "index.html"));
	});
}

if (process.env.HTTPS) {
	const server = https.createServer(app);
	server.listen(PORT, HOST, afterServerStart);
} else {
	app.listen(PORT, HOST, afterServerStart);
}
	
function afterServerStart() {
	if (process.env.HTTPS && PORT === 80) {
		createHttpsRedirectServer();
		console.log("🏎️ Redirecting to https");
	}

	console.log(`🚀 Server api is running`);	
}