const express = require("express");
const bodyParser = require("body-parser");
const { Octokit } = require("@octokit/rest");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const octokit = new Octokit({ auth: process.env.GH_TOKEN });

const GH_OWNER = "AbdulAlim-01";
const GH_REPO = "app_build";

app.post("/generate-app", async (req, res) => {
  const { url, appName, packageName } = req.body;

  if (!url || !appName || !packageName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const payload = { url, appName, packageName };

  try {
    await octokit.repos.createDispatchEvent({
      owner: GH_OWNER,
      repo: GH_REPO,
      event_type: "build-cordova",
      client_payload: payload,
    });

    const zipName = `${appName}.zip`;
    const downloadURL = `https://github.com/${GH_OWNER}/${GH_REPO}/releases/latest/download/${zipName}`;

    return res.status(200).json({
      message: "Build started. Check the download link in ~5–10 minutes.",
      download_url: downloadURL,
    });
  } catch (e) {
    console.error("Dispatch failed:", e);
    return res.status(500).json({ error: "Build trigger failed" });
  }
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});
