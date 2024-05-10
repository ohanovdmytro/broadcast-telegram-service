const { TelegramClient, client } = require("telegram");
const { StoreSession } = require("telegram/sessions");

const { userbots } = require("./const/userbots");
const { handleSendMessage } = require("./handlers/handleSendMessage");

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

const slaveClients = [];

userbots.map((userbot, index) => {
  const client = new TelegramClient(
    slaveSessions[index],
    userbot.apiId,
    userbot.apiHash
  );
  slaveClients.push(client);
});

const startSender = async () => {
  while (true) {
    await handleSendMessage();
    await new Promise((resolve) => setTimeout(resolve, 60 * 1000)); // Wait for 1 minute
  }
};

module.exports = {
  startSender,
};
