const fs = require("fs");
const { TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const { readCache } = require("../helpers/readCache");
const { sendMessage } = require("./sendMessage");
const { userbots } = require("../const/userbots");

const slaveSessions = [
  new StoreSession("session_1"),
  new StoreSession("session_2"),
  new StoreSession("session_3"),
  new StoreSession("session_4"),
  new StoreSession("session_5"),
  new StoreSession("session_6"),
  new StoreSession("session_7"),
  new StoreSession("session_8"),
];
const slaveClients = userbots.map((userbot, index) => {
  return new TelegramClient(
    slaveSessions[index],
    userbot.apiId,
    userbot.apiHash
  );
});

async function handleSendMessage() {
  const users = await readCache();

  /* Logger - users read */
  console.log(`${new Date()} -- Users read`);

  let clientIndex = 0;
  let sentCount = 0;

  while (true) {
    if (!users.some((user) => !user.isSent)) {
      break;
    }

    for (const user of users) {
      if (user.isSent || !user.username || user.username === "") {
        continue;
      }

      const client = slaveClients[clientIndex];

      await sendMessage({
        username: user.username,
        client: client,
        slaveIndex: clientIndex,
      });
      user.isSent = true;

      sentCount++;

      if (sentCount % 3 === 0) {
        clientIndex = (clientIndex + 1) % slaveClients.length;
      }

      writeCache(users);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
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
