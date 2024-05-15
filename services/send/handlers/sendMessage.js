const fs = require("fs");

const { getMessage } = require("../helpers/getMessage");

async function sendMessage(props) {
  const { username, client, slaveIndex } = props;
  const slaveClient = client;

  try {
    /* Connect client */
    await slaveClient.connect();

    /* Define parse mode */
    await slaveClient.setParseMode("html");

    /* Get user entity */
    const receiver = await slaveClient.getInputEntity(username);

    /* Logger - entity */
    console.log(
      `${new Date()} -- Got user entity from slave_${slaveIndex + 1}`
    );

    /* Send message from slave client */
    const res = await slaveClient.sendMessage(receiver, {
      message: getMessage(),
    });

    if (res) {
      /* Logger - sent message */
      console.log(
        `${new Date()} -- Message sent to ${username} using client ${
          slaveIndex + 1
        }`
      );

      await slaveClient.disconnect();

      return "sent";
    }
  } catch (error) {
    console.error(
      `Error sending message to user ${username} using client ${
        slaveIndex + 1
      }: ${error}`
    );

    if (error.message === "400: PEER_FLOOD (caused by messages.SendMessage)") {
      return "error";
    }
  }
}

module.exports = {
  sendMessage,
};
