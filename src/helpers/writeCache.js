const fs = require("fs");
const path = require("path");

async function writeCache(user) {
  const username = user.username ? user.username : "";
  const name = `${user.firstName || ""} ${user.lastName || ""}`;
  const id = parseInt(user.id);

  const cacheFilePath = path.resolve(
    __dirname,
    "../../services/send/cache.csv"
  );
  const dbFilePath = path.resolve(__dirname, "../../services/send/db.json");

  try {
    // Read and update cache.csv
    if (!fs.existsSync(cacheFilePath)) {
      fs.writeFileSync(cacheFilePath, "", { encoding: "UTF-8" });
    }

    let existingContent = "";
    existingContent = fs.readFileSync(cacheFilePath, { encoding: "UTF-8" });

    const lines = existingContent.trim().split("\n");
    const existingIds = lines.map((line) => parseInt(line.split(",")[1]));

    if (existingIds.includes(id)) {
      console.log(
        `${Date()} -- User ${username} already exists in the CSV file.`
      );
      return;
    }

    const userArray = [lines.length + 1, id, username, name, "false"];
    const csvContent = "\n" + userArray.join(",");

    fs.appendFileSync(cacheFilePath, csvContent, { encoding: "UTF-8" });

    console.log(`${Date()} -- Added ${username} to CSV file.`);

    // Read and update db.json
    let dbData = [];
    if (fs.existsSync(dbFilePath)) {
      const existingDbContent = fs.readFileSync(dbFilePath, {
        encoding: "UTF-8",
      });
      dbData = JSON.parse(existingDbContent);
    }

    if (!dbData.some((entry) => entry.chatId === id)) {
      dbData.push({
        index: dbData.length,
        chat_id: id,
        username: username,
        name: name,
        isSent: false,
      });

      fs.writeFileSync(dbFilePath, JSON.stringify(dbData, null, 2), {
        encoding: "UTF-8",
      });

      console.log(`${Date()} -- Added ${username} to JSON file.`);
    } else {
      console.log(
        `${Date()} -- User ${username} already exists in the JSON file.`
      );
    }
  } catch (error) {
    console.error("Error reading or writing cache file: ", error);
  }
}

module.exports = { writeCache };
