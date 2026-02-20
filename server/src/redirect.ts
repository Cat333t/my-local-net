import express from "express";
import type { Express } from "express";

const app = express();

app.use((req, res) => {
    // redirect to https
    res.redirect(`https://${req.headers.host}${req.url}`);
});

export function createHttpsRedirectServer(): Express {
    app.listen(80);
    return app;
};

export default createHttpsRedirectServer;