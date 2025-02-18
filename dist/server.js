"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('Hello, TypeScript!');
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
