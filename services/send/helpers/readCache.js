const fs = require("fs");

async function readCache() {
  try {
    const existingContent = fs.readFileSync("cache.csv", {
      encoding: "UTF-8",
    });

    const lines = existingContent.trim().split("\n");
    const usernames = lines.map((line) => line.split(",")[2].trim());
    
    return usernames;
  } catch (error) {
    console.error("Error reading file", error);
    return [];
  }
}

module.exports = {
  readCache,
};
