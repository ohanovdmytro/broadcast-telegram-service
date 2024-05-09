const fs = require("fs");
const path = require("path");

async function writeCache(user) {
  const username = user.username ? user.username : "";
  const name = `${user.firstName || ""} ${user.lastName || ""}`;
  const id = parseInt(user.id);

  const userArray = [id, username, name];
  const csvContent = userArray.join(",") + "\n";

  const cacheFilePath = path.resolve(
    __dirname,
    "../../services/send/cache.csv"
  );

  try {
    let existingContent = "";

    existingContent = fs.readFileSync(cacheFilePath, { encoding: "UTF-8" });

    const lines = existingContent.trim().split("\n");
    const existingIds = lines.map((line) => parseInt(line.split(",")[0]));

    if (existingIds.includes(id)) {
      console.log(
        `${Date()} -- User with ID ${id} already exists in the CSV file.`
      );
      return;
    }
  } catch (error) {
    console.error("Error reading file", error);
  }

  fs.appendFileSync(cacheFilePath, csvContent, { encoding: "UTF-8" });
}

module.exports = { writeCache };
