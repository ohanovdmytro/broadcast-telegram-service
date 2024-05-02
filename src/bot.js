require("dotenv").config();

const { TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");

const { askQuestions } = require("./helpers/askQuestions");
const { handleEvent } = require("./handlers/handleEvent");

const { masterbot } = require("./static/userbots");
const { userbots } = require("./static/userbots");

const sourceChatId = process.env.HELICOPTER_CHANNEL_ID;

const masterSession = new StoreSession("session_master");
const slaveSessions = [
  new StoreSession("session_1"),
  new StoreSession("session_2"),
  new StoreSession("session_3"),
  new StoreSession("session_4"),
];

const masterClient = new TelegramClient(
  masterSession,
  masterbot.apiId,
  masterbot.apiHash,
  {
    connectionRetries: 5,
  }
);

const slaveClients = [];

userbots.map((userbot, index) => {
  const client = new TelegramClient(
    slaveSessions[index],
    userbot.apiId,
    userbot.apiHash,
    {
      connectionRetries: 5,
    }
  );
  slaveClients.push(client);
});

const start = async () => {
  try {
    await masterClient.start({
      phoneNumber: masterbot.phoneNumber,
      password: async () => await askQuestions("Please enter your password: "),
      phoneCode: async () =>
        await askQuestions("Please enter the code you received: "),
      onError: (err) => console.log(err),
    });

    for (const client of slaveClients) {
      await client.connect();
      await client.setParseMode("html");
    }

    console.log(`Tracking posts in channel ${sourceChatId}...`);

    await masterClient.addEventHandler(
      async (event) => handleEvent({ event, slaveClients }),
      new NewMessage({ chats: [sourceChatId] })
    );
  } catch (error) {
    console.error(`Error starting the bot: `, error);
  }
};

start();
