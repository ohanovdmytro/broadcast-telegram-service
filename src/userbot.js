require("dotenv").config();

const { TelegramClient, client } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");

const { askQuestions } = require("./helpers/askQuestions");
const { addEventToQueue } = require("./callbacks/messageBroker");

const { masterbot } = require("./const/masterbot");

const sourceChatId = process.env.TEST_CHANNEL_ID;

const masterSession = new StoreSession("session_master");
const masterClient = new TelegramClient(
  masterSession,
  masterbot.apiId,
  masterbot.apiHash,
  {
    connectionRetries: 5,
  }
);

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

    await masterClient.getDialogs();

    /* Listen for updates in channel */
    await masterClient.addEventHandler(async (event) => {
      addEventToQueue({ event, masterClient });
    }, new NewMessage({ chats: [sourceChatId] }));
  } catch (error) {
    console.error(`Error starting the bot: `, error);
  }
};

module.exports = {
  start,
};
