const { Api, TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const { askQuestions } = require("./helpers/askQuestions");

require("dotenv").config();

const apiHash = process.env.API_HASH;
const apiId = Number(process.env.API_ID);
const phoneNumber = process.env.PHONE_NUMBER;

const sourceChatId = process.env.SOURCE_ID;
const targetChatId = process.env.TARGET_ID;

const session = new StoreSession("session_forward");

const client = new TelegramClient(session, apiId, apiHash, {
  connectionRetries: 5,
});

const forward = async () => {
  try {
    await client.connect();
    if (!(await client.checkAuthorization())) {
      await client.start({
        phoneNumber: phoneNumber,
        password: async () =>
          await askQuestions("Please enter your password: "),
        phoneCode: async () =>
          await askQuestions("Please enter the code you received: "),
        onError: (err) => console.log(err),
      });
    }

    await client.getDialogs();

    console.log(
      `Tracking messages in chat ${sourceChatId} and forwarding them to ${targetChatId}`
    );
    ``;
    await client.addEventHandler(
      forwardMessage,
      new NewMessage({ chats: [sourceChatId] })
    );
  } catch (e) {
    console.error("Error when listening for messages: ", e);
  }
};

async function forwardMessage(event) {
  try {
    const messageId = event.message.id;

    await client.invoke(
      new Api.messages.ForwardMessages({
        fromPeer: parseInt(sourceChatId),
        toPeer: parseInt(targetChatId),
        id: [parseInt(messageId)],
      })
    );

    console.log(`${Date()} -- Message forwarded from Helicopter`);
    return;
  } catch (e) {
    console.error("Error when forwarding message: ", e);
  }
}

module.exports = {
  forward,
};
