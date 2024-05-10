const fs = require("fs");

const { readCache } = require("../helpers/readCache");
const { sendMessage } = require("./sendMessage");

async function handleSendMessage() {
  const usernames = await readCache();

  /* Logger - username read */
  console.log(`${new Date()} -- Usernames read`);

  const lastUserIndex = usernames.length > 0 ? usernames.length - 1 : -1;

  const previousLastUserIndex = fs.existsSync("lastUserIndex.txt")
    ? parseInt(fs.readFileSync("lastUserIndex.txt", "utf8"))
    : -1;

  if (lastUserIndex > previousLastUserIndex) {
    for (let i = previousLastUserIndex + 1; i <= lastUserIndex; i++) {
      if (usernames[i] === "") {
        return;
      }
      await sendMessage(usernames[i]);
      fs.writeFileSync("lastUserIndex.txt", lastUserIndex.toString(), "utf8");
    }
  }
}

module.exports = {
  handleSendMessage,
};
