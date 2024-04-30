const fs = require("fs").promises;
const path = require("path");

async function getUserId() {
  try {
    const filePath = path.join(__dirname, "..", "..", "storage", "users.json");
    const jsonData = await fs.readFile(filePath, "utf-8");
    const { userId } = JSON.parse(jsonData)[0];
    return userId;
  } catch (error) {
    console.error(`Error reading cache with userId: `, error);
  }
}

module.exports = {
    getUserId,
};
