import express from "express";
import type { Router } from "express";

const router: Router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "Hello, World!" });
});

export default router;