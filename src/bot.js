require("dotenv").config();

const { Api, TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");

const { askQuestions } = require("./helpers/askQuestions");
const { handleEvent } = require("./handlers/handleEvent");
const { getUserId } = require("./helpers/getUserId");
const { getMessage } = require("./helpers/getMessage");
const { superbot } = require("./static/userbots");

const sourceChatId = process.env.SOURCE_CHAT_TEST;
const message = getMessage();

const session = new StoreSession("session_super");

const client = new TelegramClient(session, superbot.apiId, superbot.apiHash, {
  connectionRetries: 5,
});

const start = async () => {
  try {
    await client.start({
      phoneNumber: superbot.phoneNumber,
      password: async () => await askQuestions("Please enter your password: "),
      phoneCode: async () =>
        await askQuestions("Please enter the code you received: "),
      onError: (err) => console.log(err),
    });

    await client.getDialogs();
    const userId = await getUserId();

    console.log(`Tracking posts in channel ${sourceChatId}...`);

    await client.addEventHandler(async (event) => {
      handleEvent, await client.sendMessage(userId, message);
    }, new NewMessage({ chats: [sourceChatId] }));
  } catch (error) {
    console.error(`Error spaming people: `, error);
  }
};

start();
