const { TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");

const { getMessage } = require("../helpers/getMessage");
const textMessage = getMessage();

const { userbots } = require("../static/userbots");

async function handleSendMessage(handleSendMessage) {
  const { userId, masterClient, slaveClients } = handleSendMessage;

  let slaveClientsCounter = 0;
  let messageSent = false;

  while (slaveClientsCounter < slaveClients.length && !messageSent) {
    const slaveClient = slaveClients[slaveClientsCounter];
    try {
      /* Start slaveClient */
      await slaveClient
        .start({
          phoneNumber: userbots[slaveClientsCounter].phoneNumber,
          password: async () =>
            await askQuestions("Please enter your password: "),
          phoneCode: async () =>
            await askQuestions("Please enter the code you received: "),
          onError: (err) => console.log(err),
        })
        .then(() => console.log("client started"));

      /* Define pars mode */
      await slaveClient.setParseMode("html");

      /* Get user entities */
      const usereEntity = await masterClient.getEntity(userId);
      const username = usereEntity.username;
      const receiver = await slaveClient.getInputEntity(username);

      /* Logger - entity */
      console.log(
        `${new Date()} -- Got user entity from slave_${slaveClientsCounter + 1}`
      );

      /* Send message from slave client */
      await slaveClient
        .sendMessage(receiver, {
          message: textMessage,
        })
        .then((res) => console.log("message sent"));

      /* Logger - sent mes */
      console.log(
        `${new Date()} -- Message sent to ${Number(userId)} using client ${
          slaveClientsCounter + 1
        }`
      );

      messageSent = true;
    } catch (error) {
      console.error(
        `Error sending message to user using client ${
          slaveClientsCounter + 1
        }:`,
        error
      );
      slaveClientsCounter++;
    }
  }
}

module.exports = {
  handleSendMessage,
};
