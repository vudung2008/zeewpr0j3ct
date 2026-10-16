const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'tiktok',
  permission: 0,
  description: 'Tải video TikTok thông qua reply link',
  version: '1.0.0',
};

// 1. Hàm bọc api.sendMessage thành Promise để xử lý đồng bộ
function sendMessagePromise(api, messageData, threadID, replyToMessageID) {
  return new Promise((resolve, reject) => {
    api.sendMessage(
      messageData,
      threadID,
      (err, messageInfo) => {
        if (err) return reject(err);
        resolve(messageInfo);
      },
      replyToMessageID
    );
  });
}

// 2. Logic xử lý khi người dùng phản hồi link TikTok
async function handleReplyEvent({ api, event, originalSenderID }) {
  // Chỉ chấp nhận câu trả lời từ người đã gọi lệnh ban đầu
  if (event.senderID !== originalSenderID) {
    return api.sendMessage(
      'Chỉ người thực hiện lệnh mới có quyền gửi link!',
      event.threadID,
      event.messageID
    );
  }

  const rawUrl = (event.body || '').trim();

  // Kiểm tra định dạng link TikTok cơ bản
  const isTikTokUrl = /https?:\/\/(www\.|vm\.|vt\.|t\.)?tiktok\.com\/[^\s]+/i.test(rawUrl);
  if (!isTikTokUrl) {
    return api.sendMessage(
      'Nội dung bạn gửi không phải là một liên kết TikTok hợp lệ. Vui lòng thử lại!',
      event.threadID,
      event.messageID
    );
  }

  // Thông báo bắt đầu quá trình tải
  const notifyMsg = await sendMessagePromise(
    api,
    'Đang xử lý và tải video, bạn vui lòng đợi trong giây lát...',
    event.threadID,
    event.messageID
  );

  // Đường dẫn lưu file tạm
  const cachePath = path.join(__dirname, `tiktok_${Date.now()}.mp4`);

  try {
    // Gọi API TikWM để lấy link video không watermark
    const res = await axios.post(
      'https://www.tikwm.com/api/',
      {},
      { params: { url: rawUrl } }
    );

    const data = res.data?.data;
    if (!data || !data.play) {
      throw new Error('Không lấy được link video từ API');
    }

    // Tải luồng video về bộ nhớ tạm
    const responseStream = await axios({
      method: 'GET',
      url: data.play,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(cachePath);
    responseStream.data.pipe(writer);

    // Chờ quá trình ghi file hoàn tất
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Gửi video lại cho người dùng
    await sendMessagePromise(
      api,
      {
        body: `Tiêu đề: ${data.title || 'Không có'}\nTác giả: ${data.author?.nickname || 'Không rõ'}`,
        attachment: fs.createReadStream(cachePath),
      },
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error('Lỗi tải video TikTok:', error);
    await sendMessagePromise(
      api,
      'Đã xảy ra lỗi khi tải video hoặc video có dung lượng vượt mức cho phép.',
      event.threadID,
      event.messageID
    );
  } finally {
    // Xóa file tạm sau khi gửi xong để tránh đầy dung lượng đĩa
    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath);
    }
  }
}

// 3. Hàm thực thi lệnh chính
module.exports.call = async ({ api, threadID, messageID, senderID }) => {
  try {
    const promptMessage = await sendMessagePromise(
      api,
      'Vui lòng reply tin nhắn này kèm theo đường link video TikTok cần tải:',
      threadID,
      messageID
    );

    // Đăng ký callback khi nhận được reply
    api.handlerReply(promptMessage.messageID, (context) => {
      handleReplyEvent({
        api: context.api,
        event: context.event,
        originalSenderID: senderID,
      }).catch((error) => {
        console.error('Lỗi khi xử lý video reply:', error);
      });
    });
  } catch (error) {
    console.error('Lỗi gửi tin nhắn ban đầu:', error);
  }
};