const fs = require("fs");

async function readCache() {
  try {
    const existingDbContent = fs.readFileSync("db.json", {
      encoding: "UTF-8",
    });

    const users = JSON.parse(existingDbContent);

    return users;
  } catch (error) {
    console.error("Error reading file", error);
    return [];
  }
}

module.exports = {
  readCache,
};
