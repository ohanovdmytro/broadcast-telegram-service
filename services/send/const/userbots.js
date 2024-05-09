require("dotenv").config();

const userbots = [
  {
    botId: 1,
    apiId: Number(process.env.API_ID_1),
    apiHash: process.env.API_HASH_1,
    phoneNumber: process.env.PHONE_NUMBER_1,
  },
  {
    botId: 2,
    apiId: Number(process.env.API_ID_2),
    apiHash: process.env.API_HASH_2,
    phoneNumber: process.env.PHONE_NUMBER_2,
  },
  {
    botId: 3,
    apiId: Number(process.env.API_ID_3),
    apiHash: process.env.API_HASH_3,
    phoneNumber: process.env.PHONE_NUMBER_3,
  },
  {
    botId: 4,
    apiId: Number(process.env.API_ID_4),
    apiHash: process.env.API_HASH_4,
    phoneNumber: process.env.PHONE_NUMBER_4,
  },
  {
    botId: 5,
    apiId: Number(process.env.API_ID_5),
    apiHash: process.env.API_HASH_5,
    phoneNumber: process.env.PHONE_NUMBER_5,
  },
];

module.exports = { userbots };
