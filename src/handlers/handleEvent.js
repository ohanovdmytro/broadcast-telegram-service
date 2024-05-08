require("dotenv").config();
const { handleSendMessage } = require("./handleSendMessage");

async function handleEvent(handleEvent) {
  const { event, masterClient, slaveClients } = handleEvent;

  await event.getChat();
  const message = event.message.message;
  const entities = event.message.entities;
  const chatId = parseInt(event.chatId.value).toString();

  if (
    chatId === process.env.HELICOPTER_CHANNEL_ID &&
    (message.includes("Активно") || message.includes("Виконано"))
  ) {
    for (const en of entities) {
      if (en.className === "MessageEntityMentionName") {
        const userId = en.userId.value;
        await handleSendMessage({
          userId: userId,
          masterClient: masterClient,
          slaveClients: slaveClients,
        });
      }
    }
  }
}

module.exports = {
  handleEvent,
};
