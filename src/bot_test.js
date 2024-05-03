require("dotenv").config();

const { TelegramClient, Api } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");

const { askQuestions } = require("./helpers/askQuestions");

const { masterbot } = require("./static/userbots");
const { userbots } = require("./static/userbots");

const { getMessage } = require("./helpers/getMessage");
const textMessage = getMessage();

const sourceChatId = process.env.HELICOPTER_TEST_CHANNEL_ID;

const masterSession = new StoreSession("session_master");
const session_2 = new StoreSession("session_2");

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
    await masterClient.start({
      phoneNumber: masterbot.phoneNumber,
      password: async () => await askQuestions("Please enter your password: "),
      phoneCode: async () =>
        await askQuestions("Please enter the code you received: "),
      onError: (err) => console.log(err),
    });

    const users = [
      { username: "ohanovdmytro", id: 528941926, access_hash: 4 },
      { username: "yalynka", id: 549646481, access_hash: 3 },
      { username: "shparg_admin_1", id: 6908627287, access_hash: "" },
    ];

    for (const user of users) {
      const receiver = await masterClient.getInputEntity(user.id);
      try {
        await masterClient.sendMessage(receiver, {
          message: textMessage,
        });
      } catch (e) {
        continue;
      }
    }

    console.log(`Tracking posts in channel ${sourceChatId}...`);

    await masterClient.addEventHandler(
      async (event) => await handleEvent({ event }),
      new NewMessage({ chats: [sourceChatId] })
    );
  } catch (error) {
    console.error(`Error starting the bot: `, error);
  }
};

async function handleEvent({ event }) {
  const message = event.message.message;
  const entities = event.message.entities;
  const chatId = event.message.peerId.channelId?.value.toString();

  const isBussinessPost =
    chatId === process.env.HELICOPTER_TEST_CHANNEL_ID &&
    (message.includes("Активно") || message.includes("Виконано"));

  if (isBussinessPost) {
    for (const en of entities) {
      if (en.className === "MessageEntityMentionName") {
        try {
          const client = new TelegramClient(
            session_2,
            userbots[1].apiId,
            userbots[1].apiHash,
            {
              connectionRetries: 5,
            }
          );

          await client.start({
            phoneNumber: userbots[1].phoneNumber,
            password: async () =>
              await askQuestions("Please enter your password: "),
            phoneCode: async () =>
              await askQuestions("Please enter the code you received: "),
            onError: (err) => console.log(err),
          });

          client.setParseMode("html");

          const users = [
            { username: "ohanovdmytro", id: 528941926, access_hash: 4 },
            { username: "yalynka", id: 549646481, access_hash: 3 },
            { username: "shparg_admin_1", id: 6908627287, access_hash: "" },
          ];

          for (const user of users) {
            const receiver = await client.getInputEntity(user.id);
            const message = `Hi`;
            try {
              await client.sendMessage(receiver, {
                message: textMessage,
              });
            } catch (e) {
              continue;
            }
          }
          await client.disconnect();
          console.log("Done. Message sent to all users.");
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
}

start();
