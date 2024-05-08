require("dotenv").config();

const { TelegramClient, client } = require("telegram");
const { StoreSession } = require("telegram/sessions");

const { askQuestions } = require("./askQuestions");
const { userbots } = require("../static/userbots");

const slaveSessions = [
  new StoreSession("session_1"),
  new StoreSession("session_2"),
  new StoreSession("session_3"),
  new StoreSession("session_4"),
];
const slaveClients = [];
userbots.map((userbot, index) => {
  const client = new TelegramClient(
    slaveSessions[index],
    userbot.apiId,
    userbot.apiHash,
    {
      connectionRetries: 5,
    }
  );
  slaveClients.push(client);
});

const startClients = async () => {
  try {
    await slaveClients[0].start({
      phoneNumber: userbots[0].phoneNumber,
      password: async () => await askQuestions("Please enter your password: "),
      phoneCode: async () =>
        await askQuestions("Please enter the code you received: "),
      onError: (err) => console.log(err),
    });

    await slaveClients[0].disconnect();

    /*  Logger - create sessions */
    console.log(`${new Date()} -- Sessions created`);
  } catch (error) {
    console.error(`Error creating sessions the bot: `, error);
  }
};

startClients();
