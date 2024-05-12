const fs = require("fs");
const { readCache } = require("../helpers/readCache");
const { sendMessage } = require("./sendMessage");
const { userbots } = require("../const/userbots");

async function handleSendMessage() {
  const users = await readCache();

  /* Logger - users read */
  console.log(`${new Date()} -- Users read`);

  for (const user of users) {
    if (!user.username || user.username === "") {
      continue;
    }

    if (!user.isSent) {
      const slaveIndex = Math.floor(user.index / 4);
      if (slaveIndex > userbots.length) {
        /* Logger - too many message */
        console.log(
          `${new Date()} -- More than ${
            (userbots.length + 1) * 4
          } messages sent`
        );
        return;
      }

      await sendMessage(user.username, slaveIndex);
      user.isSent = true;

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  writeCache(users);
}

async function writeCache(users) {
  try {
    const cacheFilePath = "cache.csv";
    const csvContent = users
      .map(
        (user) =>
          `${user.index},${user.id},${user.username},${user.name},${user.isSent}`
      )
      .join("\n");

    fs.writeFileSync(cacheFilePath, csvContent, { encoding: "UTF-8" });
    console.log(`${new Date()} -- Cache updated.`);
  } catch (error) {
    console.error("Error writing file", error);
  }
}

module.exports = {
  handleSendMessage,
};
