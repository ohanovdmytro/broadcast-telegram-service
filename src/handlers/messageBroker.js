const { start } = require("../app");
const { handleEvent } = require("./handlers/handleEvent");

async function processEventQueue(eventQueue) {
  while (eventQueue.length > 0) {
    const event = eventQueue.shift();
    await handleEvent(
      {
        event: event,
        masterClient: masterClient,
        slaveClients: slaveClients,
      },
      () => start()
    );
  }
}

function addEventToQueue(event) {
  const eventQueue = [];
  eventQueue.push(event);
  if (eventQueue.length === 1) {
    processEventQueue(eventQueue);
  }
}

module.exports = {
  addEventToQueue,
  processEventQueue,
};
