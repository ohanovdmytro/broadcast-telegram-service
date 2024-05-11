const fs = require("fs");
const { TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const { getMessage } = require("../helpers/getMessage");
const { userbots } = require("../const/userbots");

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
const slaveClients = userbots.map((userbot, index) => {
  return new TelegramClient(
    slaveSessions[index],
    userbot.apiId,
    userbot.apiHash
  );
});

async function sendMessage(usernames) {
  let slaveClientsCounter = 0;
  let messageSent = false;
  let userIndex = 0;

  console.log(usernames);
  while (userIndex < usernames.length) {
    const slaveClient = slaveClients[slaveClientsCounter];

    try {
      /* Connect client */
      await slaveClient.connect();

      /* Define parse mode */
      await slaveClient.setParseMode("html");

      for (let i = 0; i < 4; i++) {
        console.log(usernames[userIndex]);
        const username = usernames[userIndex];
        if (!username) break;

        console.log(`Sending from slave_${slaveClientsCounter} to ${username}`);

        /* Get user entities */
        const receiver = await slaveClient.getInputEntity(username);

        /* Logger - entity */
        console.log(
          `${new Date()} -- Got user entity from slave_${
            slaveClientsCounter + 1
          }`
        );

        /* Send message from slave client */
        await slaveClient.sendMessage(receiver, {
          message: getMessage(),
        });

        /* Logger - sent mes */
        console.log(
          `${new Date()} -- Message sent to ${username} using client ${
            slaveClientsCounter + 1
          }`
        );

        userIndex++;

        if (userIndex >= usernames.length) break;
      }

      /* Logger - save index */
      console.log(`${new Date()} -- Index saved`);

      messageSent = true;
      await slaveClient.disconnect();
    } catch (error) {
      console.log(error);
      // console.error(
      //   `Error sending message using client ${
      //     slaveClientsCounter + 1
      //   }: ${error}`
      // );

      slaveClientsCounter = (slaveClientsCounter + 1) % slaveClients.length;
    }
  }
}

module.exports = {
  sendMessage,
};
