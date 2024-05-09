const { start } = require("../userbot");
const { handleEvent } = require("./handleEvent");

async function processEventQueue(eventQueue) {
  while (eventQueue.length > 0) {
    const eventElement = eventQueue.shift();
    await handleEvent(
      {
        event: eventElement.event,
        masterClient: eventElement.masterClient,
      },
      () => start()
    );
  }
}

function addEventToQueue({ event, masterClient }) {
  const eventQueue = [];
  eventQueue.push({ event, masterClient });
  if (eventQueue.length === 1) {
    processEventQueue(eventQueue);
  }
}

module.exports = {
  addEventToQueue,
  processEventQueue,
};
