const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");

router.get("/", function (req, res, next) {
  res.json({ message: "Welcome to the API" });
});

router.get("/files", async function (req, res, next) {
  try {
    const directoryPath = path.join(__dirname, "..", "data", "demo.json");
    const data = await fs.readFile(directoryPath, "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading file:", error);
    res.status(500).json({
      error: "Failed to read file",
      message: error.message,
    });
  }
});

module.exports = router;
