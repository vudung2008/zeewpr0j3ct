/**
 * Menu Builder - Tạo interactive menus với reply/reaction callbacks
 */

class MenuBuilder {
  constructor(api, threadID) {
    this.api = api;
    this.threadID = threadID;
    this.items = [];
    this.type = 'reply'; // 'reply' or 'reaction'
    this.title = '';
    this.footer = '';
  }

  setTitle(title) {
    this.title = title;
    return this;
  }

  setFooter(footer) {
    this.footer = footer;
    return this;
  }

  setType(type) {
    if (!['reply', 'reaction'].includes(type)) {
      throw new Error('Menu type must be "reply" or "reaction"');
    }
    this.type = type;
    return this;
  }

  addItem(label, callback) {
    this.items.push({ label, callback });
    return this;
  }

  async send() {
    if (this.items.length === 0) {
      throw new Error('Menu must have at least one item');
    }

    let message = '';
    
    if (this.title) {
      message += `${this.title}\n\n`;
    }

    if (this.type === 'reply') {
      message += this.items.map((item, index) => 
        `${index + 1}. ${item.label}`
      ).join('\n');
      
      if (this.footer) {
        message += `\n\n${this.footer}`;
      }

      const info = await this.api.sendMessageAsync(message, this.threadID);

      this.api.handlerReply(info.messageID, async ({ api, event }) => {
        const userReply = String(event.body || '').trim();
        const choice = parseInt(userReply, 10);

        if (isNaN(choice) || choice < 1 || choice > this.items.length) {
          await api.sendMessageAsync(
            `❌ Invalid choice. Please reply with 1-${this.items.length}`,
            event.threadID
          );
          return;
        }

        const selected = this.items[choice - 1];
        try {
          await selected.callback({ api, event, choice, label: selected.label });
        } catch (error) {
          await api.sendMessageAsync(
            `Error: ${error.message}`,
            event.threadID
          );
        }
      });

      return info;
    } else if (this.type === 'reaction') {
      const reactions = ['👍', '❤️', '😆', '😮', '😢', '😠', '👏', '🔥', '💯'];
      
      message += this.items.slice(0, 9).map((item, index) => 
        `${reactions[index]} ${item.label}`
      ).join('\n');
      
      if (this.footer) {
        message += `\n\n${this.footer}`;
      }

      const info = await this.api.sendMessageAsync(message, this.threadID);

      this.api.handlerReaction(info.messageID, async ({ api, event }) => {
        const reaction = event.reaction;
        const index = reactions.indexOf(reaction);

        if (index === -1 || index >= this.items.length) {
          return; // Invalid reaction, ignore
        }

        const selected = this.items[index];
        try {
          await selected.callback({ api, event, choice: index + 1, label: selected.label, reaction });
        } catch (error) {
          await api.sendMessageAsync(
            `Error: ${error.message}`,
            event.threadID
          );
        }
      });

      return info;
    }
  }
}

/**
 * Paginated Menu Builder - Menu với pagination
 */
class PaginatedMenuBuilder {
  constructor(api, threadID) {
    this.api = api;
    this.threadID = threadID;
    this.items = [];
    this.title = '';
    this.pageSize = 5;
    this.currentPage = 0;
  }

  setTitle(title) {
    this.title = title;
    return this;
  }

  setPageSize(size) {
    this.pageSize = size;
    return this;
  }

  addItems(items) {
    this.items.push(...items);
    return this;
  }

  async send() {
    const totalPages = Math.ceil(this.items.length / this.pageSize);
    
    const showPage = async (page) => {
      const start = page * this.pageSize;
      const end = start + this.pageSize;
      const pageItems = this.items.slice(start, end);

      let message = this.title ? `${this.title}\n\n` : '';
      message += pageItems.map((item, index) => 
        `${start + index + 1}. ${item.label}`
      ).join('\n');
      message += `\n\n📄 Page ${page + 1}/${totalPages}`;
      message += '\nReply: number (select) | "next" | "prev"';

      const info = await this.api.sendMessageAsync(message, this.threadID);

      this.api.handlerReply(info.messageID, async ({ api, event }) => {
        const reply = String(event.body || '').trim().toLowerCase();

        if (reply === 'next') {
          if (page < totalPages - 1) {
            await showPage(page + 1);
          } else {
            await api.sendMessageAsync('Already at last page', event.threadID);
          }
        } else if (reply === 'prev') {
          if (page > 0) {
            await showPage(page - 1);
          } else {
            await api.sendMessageAsync('Already at first page', event.threadID);
          }
        } else {
          const choice = parseInt(reply, 10);
          if (!isNaN(choice) && choice >= 1 && choice <= this.items.length) {
            const selected = this.items[choice - 1];
            try {
              await selected.callback({ api, event, choice, label: selected.label });
            } catch (error) {
              await api.sendMessageAsync(`Error: ${error.message}`, event.threadID);
            }
          } else {
            await api.sendMessageAsync(
              `Invalid input. Reply: 1-${this.items.length}, "next", or "prev"`,
              event.threadID
            );
          }
        }
      });

      return info;
    };

    return showPage(this.currentPage);
  }
}

/**
 * Confirmation Dialog Builder
 */
class ConfirmationBuilder {
  constructor(api, threadID) {
    this.api = api;
    this.threadID = threadID;
    this.message = '';
    this.onConfirmCallback = null;
    this.onCancelCallback = null;
    this.confirmText = '✅ Yes';
    this.cancelText = '❌ No';
  }

  setMessage(message) {
    this.message = message;
    return this;
  }

  setConfirmText(text) {
    this.confirmText = text;
    return this;
  }

  setCancelText(text) {
    this.cancelText = text;
    return this;
  }

  onConfirm(callback) {
    this.onConfirmCallback = callback;
    return this;
  }

  onCancel(callback) {
    this.onCancelCallback = callback;
    return this;
  }

  async send() {
    if (!this.message) {
      throw new Error('Message is required');
    }

    const fullMessage = `${this.message}\n\n${this.confirmText}\n${this.cancelText}\n\nReply: yes/no`;

    const info = await this.api.sendMessageAsync(fullMessage, this.threadID);

    this.api.handlerReply(info.messageID, async ({ api, event }) => {
      const reply = String(event.body || '').trim().toLowerCase();

      if (['yes', 'y', 'ok', 'confirm'].includes(reply)) {
        if (this.onConfirmCallback) {
          try {
            await this.onConfirmCallback({ api, event });
          } catch (error) {
            await api.sendMessageAsync(`Error: ${error.message}`, event.threadID);
          }
        }
      } else if (['no', 'n', 'cancel'].includes(reply)) {
        if (this.onCancelCallback) {
          try {
            await this.onCancelCallback({ api, event });
          } catch (error) {
            await api.sendMessageAsync(`Error: ${error.message}`, event.threadID);
          }
        }
      } else {
        await api.sendMessageAsync(
          'Invalid response. Reply: yes/no',
          event.threadID
        );
      }
    });

    return info;
  }
}

/**
 * Form Builder - Collect multiple inputs
 */
class FormBuilder {
  constructor(api, threadID) {
    this.api = api;
    this.threadID = threadID;
    this.fields = [];
    this.title = '';
    this.onCompleteCallback = null;
  }

  setTitle(title) {
    this.title = title;
    return this;
  }

  addField(name, label, validator) {
    this.fields.push({ name, label, validator });
    return this;
  }

  onComplete(callback) {
    this.onCompleteCallback = callback;
    return this;
  }

  async send() {
    if (this.fields.length === 0) {
      throw new Error('Form must have at least one field');
    }

    const responses = {};
    let currentFieldIndex = 0;

    const askField = async () => {
      if (currentFieldIndex >= this.fields.length) {
        // All fields completed
        if (this.onCompleteCallback) {
          try {
            await this.onCompleteCallback({ api: this.api, responses });
          } catch (error) {
            await this.api.sendMessageAsync(`Error: ${error.message}`, this.threadID);
          }
        }
        return;
      }

      const field = this.fields[currentFieldIndex];
      const message = `${this.title ? this.title + '\n\n' : ''}📝 ${field.label}\n(${currentFieldIndex + 1}/${this.fields.length})`;

      const info = await this.api.sendMessageAsync(message, this.threadID);

      this.api.handlerReply(info.messageID, async ({ api, event }) => {
        const value = event.body;

        // Validate
        if (field.validator && typeof field.validator === 'function') {
          try {
            const isValid = field.validator(value);
            if (!isValid) {
              await api.sendMessageAsync(
                '❌ Invalid input. Please try again.',
                event.threadID
              );
              await askField(); // Ask again
              return;
            }
          } catch (error) {
            await api.sendMessageAsync(
              `❌ Validation error: ${error.message}`,
              event.threadID
            );
            await askField(); // Ask again
            return;
          }
        }

        responses[field.name] = value;
        currentFieldIndex++;
        await askField(); // Ask next field
      });
    };

    await askField();
  }
}

module.exports = {
  MenuBuilder,
  PaginatedMenuBuilder,
  ConfirmationBuilder,
  FormBuilder,
};
