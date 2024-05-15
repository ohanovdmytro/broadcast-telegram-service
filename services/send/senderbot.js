const { handleSendMessage } = require("./handlers/handleSendMessage");

const startSender = async () => {
  while (true) {
    await handleSendMessage();
    await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
  }
};

module.exports = {
  startSender,
};
