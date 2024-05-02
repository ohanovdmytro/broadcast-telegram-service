const { Api } = require("telegram");
const { getMessage } = require("../helpers/getMessage");

const textMessage = getMessage();

async function handleEvent({ event, slaveClients }) {
  const message = event.message.message;
  const entities = event.message.entities;
  const chatId = event.message.peerId.channelId?.value.toString();
  if (
    chatId === process.env.HELICOPTER_CHANNEL_ID &&
    (message.includes("Активно") || message.includes("Виконано"))
  ) {
    for (const en of entities) {
      if (en.className === "MessageEntityMentionName") {
        let slaveClientCounter = 0;
        let messageSent = false;

        while (slaveClientCounter < slaveClients.length && !messageSent) {
          const slaveClient = slaveClients[slaveClientCounter];

          try {
            const userIdEntity = await slaveClient.getEntity(
              Number(en.userId.value)
            );

            await slaveClient.sendMessage(`${userIdEntity.username}`, {
              message: textMessage,
            });
            console.log(
              `Message sent to ${Number(en.userId.value)} using client ${
                slaveClientCounter + 1
              }`
            );

            messageSent = true;
          } catch (error) {
            console.error(
              `Error sending message to user using client ${
                slaveClientCounter + 1
              }:`,
              error
            );
            slaveClientCounter++;
          }
        }
      }
    }
  }
}

module.exports = {
  handleEvent,
};
