const axios = require("axios");

module.exports.config = {
  name: "avatar",
  permission: 0,
  description: "avatar command",
  version: "1.0.0",
};

module.exports.setup = ({ api, client }) => {
  client.logger(`Setup avatar command`, "info");
};

module.exports.call = async ({ api, event, threadID, messageID }) => {
  const avatarUrl = `https://graph.facebook.com/${event.senderID}/picture?type=large`;

  try {
    const response = await axios({
      method: "GET",
      url: avatarUrl,
      responseType: "stream",
    });

    api.sendMessage(
      {
        body: "Avatar của bạn:",
        attachment: response.data,
      },
      threadID,
      messageID,
    );
  } catch (error) {
    api.sendMessage(
      `Không thể tải avatar: ${error.message}`,
      threadID,
      messageID,
    );
  }
};

module.exports.reply = async ({ api, event }) => {
  const avatarUrl = `https://graph.facebook.com/${event.senderID}/picture?type=large`;
  console.log(event);
  try {
    const response = await axios({
      method: "GET",
      url: avatarUrl,
      responseType: "stream",
    });

    api.sendMessage(
      {
        body: "Avatar của bạn:",
        attachment: response.data,
      },
      event.threadID,
      event.messageID,
    );
  } catch (error) {
    api.sendMessage(
      `Không thể tải avatar: ${error.message}`,
      event.threadID,
      event.messageID,
    );
  }
};
