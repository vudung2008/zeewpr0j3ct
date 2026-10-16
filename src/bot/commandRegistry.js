/**
 * Dynamic Command Registry - Đăng ký command với menu workflows
 */

class CommandRegistry {
  constructor(client) {
    this.client = client;
    this.workflows = new Map();
  }

  /**
   * Đăng ký command mới với workflow
   */
  register(config) {
    const {
      name,
      permission = 0,
      description = '',
      workflow
    } = config;

    if (!name) {
      throw new Error('Command name is required');
    }

    if (!workflow) {
      throw new Error('Workflow is required');
    }

    // Tạo plugin object
    const plugin = {
      config: {
        name,
        permission,
        description,
        version: '1.0.0',
      },
      call: async (context) => {
        try {
          await this.executeWorkflow(workflow, context);
        } catch (error) {
          context.api.sendMessage(
            `Error: ${error.message}`,
            context.threadID
          );
        }
      }
    };

    // Đăng ký vào client.commands
    this.client.commands.set(name, plugin);
    this.workflows.set(name, workflow);

    this.client.logger(`Registered dynamic command: ${name}`, 'success');
    return this;
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(workflow, context) {
    const { api, threadID } = context;

    if (workflow.type === 'menu') {
      await this.showMenu(workflow, context);
    } else if (workflow.type === 'action') {
      await workflow.handler(context);
    } else if (workflow.type === 'message') {
      await api.sendMessageAsync(workflow.content, threadID);
    }
  }

  /**
   * Show menu và đăng ký callbacks
   */
  async showMenu(workflow, context) {
    const { api, threadID } = context;

    // Build menu message
    let message = workflow.title ? `${workflow.title}\n\n` : '';
    
    if (workflow.items && workflow.items.length > 0) {
      workflow.items.forEach((item, index) => {
        if (workflow.menuType === 'reaction') {
          const reactions = ['👍', '❤️', '😆', '😮', '😢', '😠', '👏', '🔥', '💯'];
          message += `${reactions[index]} ${item.label}\n`;
        } else {
          message += `${index + 1}. ${item.label}\n`;
        }
      });
    }

    if (workflow.footer) {
      message += `\n${workflow.footer}`;
    }

    // Send menu
    const info = await api.sendMessageAsync(message, threadID);

    // Register callback
    if (workflow.menuType === 'reaction') {
      api.handlerReaction(info.messageID, async ({ api, event }) => {
        await this.handleMenuReaction(workflow, context, event);
      });
    } else {
      api.handlerReply(info.messageID, async ({ api, event }) => {
        await this.handleMenuReply(workflow, context, event);
      });
    }
  }

  /**
   * Handle menu reply
   */
  async handleMenuReply(workflow, originalContext, event) {
    const { api, event: originalEvent } = originalContext;
    const reply = String(event.body || '').trim();
    const choice = parseInt(reply, 10);

    if (isNaN(choice) || choice < 1 || choice > workflow.items.length) {
      return api.sendMessage(
        `❌ Invalid choice. Please reply 1-${workflow.items.length}`,
        event.threadID,
        event.messageID
      );
    }

    const selected = workflow.items[choice - 1];
    
    // Create new context for selected item
    const newContext = {
      ...originalContext,
      api,
      event,
      threadID: event.threadID,
      senderID: event.senderID,
      messageID: event.messageID,
      selectedItem: selected,
      selectedChoice: choice,
    };

    // Execute selected item action
    if (selected.action) {
      await this.executeWorkflow(selected.action, newContext);
    }
  }

  /**
   * Handle menu reaction
   */
  async handleMenuReaction(workflow, originalContext, event) {
    const { api } = originalContext;
    const reactions = ['👍', '❤️', '😆', '😮', '😢', '😠', '👏', '🔥', '💯'];
    const reaction = event.reaction;
    const index = reactions.indexOf(reaction);

    if (index === -1 || index >= workflow.items.length) {
      return; // Invalid reaction, ignore
    }

    const selected = workflow.items[index];
    
    // Create new context
    const newContext = {
      ...originalContext,
      api,
      event,
      threadID: event.threadID,
      senderID: event.senderID,
      messageID: event.messageID,
      selectedItem: selected,
      selectedChoice: index + 1,
      selectedReaction: reaction,
    };

    // Execute selected item action
    if (selected.action) {
      await this.executeWorkflow(selected.action, newContext);
    }
  }

  /**
   * Unregister command
   */
  unregister(name) {
    this.client.commands.delete(name);
    this.workflows.delete(name);
    this.client.logger(`Unregistered command: ${name}`, 'info');
    return this;
  }

  /**
   * Get all registered workflows
   */
  list() {
    return Array.from(this.workflows.keys());
  }
}

/**
 * Workflow Builder - Fluent API để build workflows
 */
class WorkflowBuilder {
  constructor() {
    this.workflow = {
      type: 'menu',
      menuType: 'reply',
      title: '',
      footer: '',
      items: [],
    };
  }

  setTitle(title) {
    this.workflow.title = title;
    return this;
  }

  setFooter(footer) {
    this.workflow.footer = footer;
    return this;
  }

  setMenuType(type) {
    if (!['reply', 'reaction'].includes(type)) {
      throw new Error('Menu type must be "reply" or "reaction"');
    }
    this.workflow.menuType = type;
    return this;
  }

  addItem(label, action) {
    this.workflow.items.push({ label, action });
    return this;
  }

  build() {
    return this.workflow;
  }

  // Helper: Create nested menu
  static menu() {
    return new WorkflowBuilder();
  }

  // Helper: Create action
  static action(handler) {
    return {
      type: 'action',
      handler,
    };
  }

  // Helper: Create message
  static message(content) {
    return {
      type: 'message',
      content,
    };
  }
}

module.exports = { CommandRegistry, WorkflowBuilder };
