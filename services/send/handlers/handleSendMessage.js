const fs = require("fs");
const { TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const { readCache } = require("../helpers/readCache");
const { sendMessage } = require("./sendMessage");
const { userbots } = require("../const/userbots");

const slaveSessions = userbots.map(
  (_, index) => new StoreSession(`session_${index + 1}`)
);
const slaveClients = userbots.map((userbot, index) => {
  return new TelegramClient(
    slaveSessions[index],
    userbot.apiId,
    userbot.apiHash
  );
});

async function handleSendMessage() {
  const users = await readCache();

  console.log(`${new Date()} -- Users read`);

  let clientIndex = 0;
  let sentCount = 0;

  const usersToSend = users.filter(
    (user) => !user.isSent && user.username && user.username !== ""
  );

  for (const user of usersToSend) {
    let messageSent = false;
    while (!messageSent) {
      const client = slaveClients[clientIndex];

      const res = await sendMessage({
        username: user.username,
        client: client,
        slaveIndex: clientIndex,
      });

      if (res === "sent") {
        user.isSent = true;
        sentCount++;
        messageSent = true;

        if (sentCount === 3) {
          sentCount = 0;
          clientIndex = (clientIndex + 1) % slaveClients.length;
        }
      } else if (res === "error") {
        clientIndex = (clientIndex + 1) % slaveClients.length;
      }

      writeCache(users);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

async function writeCache(users) {
  try {
    const csvContent = users
      .map(
        (user) =>
          `${user.index},${user.chat_id},${user.username},${user.name},${user.isSent}`
      )
      .join("\n");

    fs.writeFileSync("cache.csv", csvContent, { encoding: "UTF-8" });

    fs.writeFileSync("db.json", JSON.stringify(users, null, 2), {
      encoding: "UTF-8",
    });
    console.log(`${new Date()} -- Cache updated.`);
  } catch (error) {
    console.error("Error writing file", error);
  }
}

module.exports = {
  handleSendMessage,
};
