require("dotenv").config();

const { writeCache } = require("../helpers/writeCache");

async function handleEvent(handleEvent) {
  const { event, masterClient } = handleEvent;

  await event.getChat();
  const message = event.message.message;
  const entities = event.message.entities;
  const chatId = parseInt(event.chatId.value).toString();

  if (
    chatId === process.env.TEST_CHANNEL_ID &&
    (message.includes("Активно") || message.includes("Виконано"))
  ) {
    for (const en of entities) {
      if (en.className === "MessageEntityMentionName") {
        try {
          const userId = en.userId.value;

          const userEntity = await masterClient.getEntity(userId);

          await writeCache(userEntity);
        } catch (error) {
          console.error("Error fetching username and writing it", error);
        }
      }
    }
  }
}

module.exports = {
  handleEvent,
};
