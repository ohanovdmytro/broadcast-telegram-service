const fs = require("fs");

async function readCache() {
  try {
    const existingContent = fs.readFileSync("cache.csv", {
      encoding: "UTF-8",
    });

    const lines = existingContent.trim().split("\n");
    const users = lines.map((line) => {
      const [index, id, username, name, isSent] = line.split(",");
      return {
        index: parseInt(index),
        id: parseInt(id),
        username: username.trim(),
        name: name.trim(),
        isSent: isSent.trim() === "true",
      };
    });

    return users;
  } catch (error) {
    console.error("Error reading file", error);
    return [];
  }
}

module.exports = {
  readCache,
};
