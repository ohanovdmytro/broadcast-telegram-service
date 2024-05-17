require("dotenv").config();

const { TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");

const { askQuestions } = require("./askQuestions");
const { userbots } = require("../const/userbots");

const slaveSessions = userbots.map(
  (_, index) => new StoreSession(`session_${index + 1}`)
);
const slaveClients = userbots.map((userbot, index) => {
  return new TelegramClient(
    slaveSessions[index],
    userbot.apiId,
    userbot.apiHash,
    {
      connectionRetries: 5,
    }
  );
});

const startClients = async () => {
  try {
    for (let i = 0; i < slaveClients.length; i++) {
      await slaveClients[i].start({
        phoneNumber: userbots[i].phoneNumber,
        password: async () =>
          await askQuestions("Please enter your password: "),
        phoneCode: async () =>
          await askQuestions("Please enter the code you received: "),
        onError: (err) => console.log(err),
      });

      await slaveClients[i].disconnect();
    }

    /*  Logger - create sessions */
    console.log(`${new Date()} -- Sessions created`);
  } catch (error) {
    console.error(`Error creating sessions the bot: `, error);
  }
};

startClients();
