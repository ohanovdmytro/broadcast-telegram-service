require("dotenv").config();

const { TelegramClient, Api } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const fs = require("fs");

const { askQuestions } = require("./helpers/askQuestions");

const { masterbot } = require("./static/userbots");
const { userbots } = require("./static/userbots");

const { getMessage } = require("./helpers/getMessage");
const textMessage = getMessage();

const sourceChatId = process.env.HELICOPTER_TEST_CHANNEL_ID;

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

const start = async () => {
  try {
    await masterClient.start({
      phoneNumber: masterbot.phoneNumber,
      password: async () => await askQuestions("Please enter your password: "),
      phoneCode: async () =>
        await askQuestions("Please enter the code you received: "),
      onError: (err) => console.log(err),
    });

    await masterClient.addEventHandler(
      async (event) => await handleEvent({ event, slaveSessions }),
      new NewMessage({ chats: [sourceChatId] })
    );
  } catch (error) {
    console.error(`Error starting the bot: `, error);
  }
};

async function handleEvent({ event, slaveSessions }) {
  const message = event.message.message;
  const entities = event.message.entities;
  const chatId = event.message.peerId.channelId?.value.toString();

  if (
    chatId === process.env.HELICOPTER_TEST_CHANNEL_ID &&
    (message.includes("Активно") || message.includes("Виконано"))
  ) {
    for (const en of entities) {
      if (en.className === "MessageEntityMentionName") {
        let slaveSessionsCounter = 0;
        let messageSent = false;

        while (slaveSessionsCounter < slaveSessions.length && !messageSent) {
          /* Start slave client */
          const slaveClient = new TelegramClient(
            slaveSessions[slaveSessionsCounter],
            userbots[slaveSessionsCounter].apiId,
            userbots[slaveSessionsCounter].apiHash,
            {
              connectionRetries: 5,
            }
          );

          await slaveClient.start({
            phoneNumber: userbots[slaveSessionsCounter].phoneNumber,
            password: async () =>
              await input.text("Please enter your password: "),
            phoneCode: async () =>
              await input.text("Please enter the code you received: "),
            onError: (err) => console.log(err),
          });

          /* connect and set pars mode for slave client */
          await slaveClient.setParseMode("html");

          try {
            /* Get user entities */
            const receiverEntity = await slaveClient.getEntity(
              parseInt(en.userId.value)
            );
            const username = receiverEntity.username;
            const receiver = await slaveClient.getInputEntity(username);

            /* Logger - entity */
            console.log(
              `${Date.now()} -- Getting user entity from slave_${
                slaveSessionsCounter + 1
              }`
            );

            /* Send message from slave client */
            await slaveClient.sendMessage(receiver, {
              message: textMessage,
            });

            /* Logger - sent mes */
            console.log(
              `Message sent to ${Number(en.userId.value)} using client ${
                slaveSessionsCounter + 1
              }`
            );

            messageSent = true;
          } catch (error) {
            console.error(
              `Error sending message to user using client ${
                slaveSessionsCounter + 1
              }:`,
              error
            );
            slaveSessionsCounter++;
          }
        }
      }
    }
  }
}

start();
