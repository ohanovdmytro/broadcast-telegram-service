require("dotenv").config();

const { TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");

const { askQuestions } = require("./helpers/askQuestions");

const { masterbot } = require("./static/userbots");
const { userbots } = require("./static/userbots");
const { addEventToQueue } = require("./handlers/messageBroker");

const sourceChatId = process.env.HELICOPTER_CHANNEL_ID;

const masterSession = new StoreSession("session_master");
const masterClient = new TelegramClient(
  masterSession,
  masterbot.apiId,
  masterbot.apiHash,
  {
    connectionRetries: 5,
  }
);

const slaveSessions = [
  new StoreSession("session_1"),
  new StoreSession("session_2"),
  new StoreSession("session_3"),
  new StoreSession("session_4"),
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

const start = async () => {
  try {
    /* Start masterClient */
    await masterClient.start({
      phoneNumber: masterbot.phoneNumber,
      password: async () => await askQuestions("Please enter your password: "),
      phoneCode: async () =>
        await askQuestions("Please enter the code you received: "),
      onError: (err) => console.log(err),
    });

    console.log(
      `${new Date()} -- Tracking posts in channel ${sourceChatId}...`
    );

    /* Listen for updates in channel */
    await masterClient.addEventHandler(async (event) => {
      addEventToQueue(event);
    }, new NewMessage({ chats: [sourceChatId] }));
  } catch (error) {
    console.error(`Error starting the bot: `, error);
  }
};

start();

module.exports = {
  start,
};
