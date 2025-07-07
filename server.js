const express = require("express");
const bodyParser = require("body-parser");
const { Octokit } = require("@octokit/rest");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const octokit = new Octokit({ auth: process.env.GH_TOKEN });

const GH_OWNER = "your-github-username";
const GH_REPO = "your-repo-name";

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

    return res.status(200).json({
      message: "Build started. It may take 5–10 minutes.",
      download_link: `https://github.com/${GH_OWNER}/${GH_REPO}/releases/latest`,
    });
  } catch (e) {
    console.error("Dispatch failed:", e);
    return res.status(500).json({ error: "Build trigger failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
