const fs = require("fs").promises;
const path = require("path");

async function handleEvent(event) {
  const message = event.message.message;
  const entities = event.message.entities;

  if (message.includes("Активно") || message.includes("Виконано")) {
    for (const en of entities) {
      if (en.className === "MessageEntityMentionName") {
        const userId = Number(en.userId.value);

        try {
          const filePath = path.join(
            __dirname,
            "..",
            "..",
            "storage",
            "users.json"
          );
          let existingData = [];
          try {
            const jsonData = await fs.readFile(filePath, "utf-8");
            existingData = JSON.parse(jsonData);
          } catch (error) {}
          existingData.push({ id: userId });

          const updatedJsonData = JSON.stringify(existingData, null, 2);
          await fs.writeFile(filePath, updatedJsonData);
        } catch (error) {
          console.error("Error writing userId to storage/users.json:", error);
        }
      }
    }
  }
}

module.exports = {
  handleEvent,
};
