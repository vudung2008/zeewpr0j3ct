const { WorkflowBuilder } = require('../src/bot/commandRegistry');

/**
 * Định nghĩa commands với workflows
 * Tất cả plugins (bao gồm workflows) đều trong plugins/
 */

module.exports = [
  // Help command - Xem danh sách và chi tiết commands
  {
    name: 'help',
    permission: 0,
    description: 'View command list and usage',
    workflow: WorkflowBuilder.menu()
      .setTitle('📖 Help Center')
      .setFooter('Reply với số để xem category hoặc gửi "!cmdhelp <command>" để xem chi tiết')
      .addItem('📋 All Commands', WorkflowBuilder.action(async ({ api, threadID, client }) => {
        if (!client || !client.commands) {
          return api.sendMessageAsync('❌ Cannot access command list', threadID);
        }

        const commands = Array.from(client.commands.values());
        const publicCmds = commands.filter(cmd => cmd.config.permission === 0);
        const adminCmds = commands.filter(cmd => cmd.config.permission === 1);

        let message = '📋 All Commands\n\n';
        
        if (publicCmds.length > 0) {
          message += '👥 Public Commands:\n';
          publicCmds.forEach(cmd => {
            message += `  !${cmd.config.name}`;
            if (cmd.config.description) {
              message += ` - ${cmd.config.description}`;
            }
            message += '\n';
          });
        }

        if (adminCmds.length > 0) {
          message += '\n🔧 Admin Commands:\n';
          adminCmds.forEach(cmd => {
            message += `  !${cmd.config.name}`;
            if (cmd.config.description) {
              message += ` - ${cmd.config.description}`;
            }
            message += '\n';
          });
        }

        message += '\n💡 Tip: Send "!cmdhelp <command>" for usage details';

        await api.sendMessageAsync(message, threadID);
      }))
      .addItem('🎮 Fun & Games', WorkflowBuilder.action(async ({ api, threadID }) => {
        const funCommands = [
          '!game - Game center (dice, slots, coin flip)',
          '!pizza - Order pizza with full menu',
          '!shop - Browse electronics store',
        ];
        
        await api.sendMessageAsync(
          '🎮 Fun & Games\n\n' + funCommands.join('\n') +
          '\n\n💡 Try these commands for interactive menus!',
          threadID
        );
      }))
      .addItem('⚙️ Settings & Tools', WorkflowBuilder.action(async ({ api, threadID }) => {
        const toolCommands = [
          '!settings - Bot settings and preferences',
          '!admin - Admin panel (admin only)',
          '!apitest - Test API functions',
          '!menu - Menu builder examples',
        ];
        
        await api.sendMessageAsync(
          '⚙️ Settings & Tools\n\n' + toolCommands.join('\n') +
          '\n\n🔧 Configuration and testing commands',
          threadID
        );
      }))
      .addItem('ℹ️ About Bot', WorkflowBuilder.action(async ({ api, threadID }) => {
        const stats = api.getStats();
        const uptime = Math.floor(stats.uptime / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;

        await api.sendMessageAsync(
          '🤖 Bot Information\n\n' +
          `Name: zeewpr0j3ct\n` +
          `Version: 1.0.0\n` +
          `Uptime: ${hours}h ${minutes}m ${seconds}s\n` +
          `API Calls: ${stats.totalCalls}\n` +
          `Error Rate: ${stats.errorRate}\n\n` +
          `📚 Docs: Check WORKFLOW.md for details`,
          threadID
        );
      }))
      .build()
  },

  // Example 1: Simple menu với reply
  {
    name: 'shop',
    permission: 0,
    description: 'Shop menu',
    workflow: WorkflowBuilder.menu()
      .setTitle('🛒 Welcome to Shop!')
      .setFooter('Reply với số để chọn')
      .addItem('📱 Phones', WorkflowBuilder.menu()
        .setTitle('📱 Phone Categories')
        .addItem('iPhone', WorkflowBuilder.action(async ({ api, threadID }) => {
          await api.sendMessageAsync('iPhone models: 15 Pro, 15, 14 Pro...', threadID);
        }))
        .addItem('Samsung', WorkflowBuilder.action(async ({ api, threadID }) => {
          await api.sendMessageAsync('Samsung models: S24, S23, Fold...', threadID);
        }))
        .addItem('Back', WorkflowBuilder.message('Returning to main menu...'))
        .build()
      )
      .addItem('💻 Laptops', WorkflowBuilder.menu()
        .setTitle('💻 Laptop Brands')
        .addItem('MacBook', WorkflowBuilder.action(async ({ api, threadID }) => {
          await api.sendMessageAsync('MacBook Air, Pro 14", Pro 16"', threadID);
        }))
        .addItem('Dell', WorkflowBuilder.action(async ({ api, threadID }) => {
          await api.sendMessageAsync('XPS 13, XPS 15, Inspiron...', threadID);
        }))
        .build()
      )
      .addItem('🎮 Gaming', WorkflowBuilder.action(async ({ api, threadID }) => {
        await api.sendMessageAsync('PS5, Xbox Series X, Nintendo Switch', threadID);
      }))
      .build()
  },

  // Example 2: Reaction menu
  {
    name: 'settings',
    permission: 0,
    description: 'Bot settings',
    workflow: WorkflowBuilder.menu()
      .setTitle('⚙️ Bot Settings')
      .setFooter('React để chọn option')
      .setMenuType('reaction')
      .addItem('Enable notifications', WorkflowBuilder.action(async ({ api, threadID }) => {
        await api.sendMessageAsync('✅ Notifications enabled!', threadID);
      }))
      .addItem('Disable notifications', WorkflowBuilder.action(async ({ api, threadID }) => {
        await api.sendMessageAsync('❌ Notifications disabled!', threadID);
      }))
      .addItem('Language settings', WorkflowBuilder.menu()
        .setTitle('🌍 Choose Language')
        .addItem('English', WorkflowBuilder.message('✅ Language set to English'))
        .addItem('Tiếng Việt', WorkflowBuilder.message('✅ Đã chuyển sang Tiếng Việt'))
        .addItem('日本語', WorkflowBuilder.message('✅ 言語を日本語に設定しました'))
        .build()
      )
      .build()
  },

  // Example 3: Pizza ordering với nested menus
  {
    name: 'pizza',
    permission: 0,
    description: 'Order pizza',
    workflow: WorkflowBuilder.menu()
      .setTitle('🍕 Pizza Delivery')
      .setFooter('What would you like?')
      .addItem('Order Pizza', WorkflowBuilder.menu()
        .setTitle('🍕 Choose Size')
        .addItem('Small - $8', WorkflowBuilder.menu()
          .setTitle('Choose Topping')
          .addItem('Cheese', WorkflowBuilder.action(async ({ api, threadID, senderID }) => {
            const userInfo = await api.getUserInfoAsync(senderID);
            const name = userInfo[senderID].name;
            await api.sendMessageAsync(
              `✅ Order confirmed!\n\nSmall Cheese Pizza - $8\nDelivering to: ${name}\nETA: 30 minutes`,
              threadID
            );
          }))
          .addItem('Pepperoni', WorkflowBuilder.action(async ({ api, threadID, senderID }) => {
            const userInfo = await api.getUserInfoAsync(senderID);
            const name = userInfo[senderID].name;
            await api.sendMessageAsync(
              `✅ Order confirmed!\n\nSmall Pepperoni Pizza - $9\nDelivering to: ${name}\nETA: 30 minutes`,
              threadID
            );
          }))
          .addItem('Hawaiian', WorkflowBuilder.action(async ({ api, threadID }) => {
            await api.sendMessageAsync('✅ Small Hawaiian Pizza - $9 ordered!', threadID);
          }))
          .build()
        )
        .addItem('Medium - $12', WorkflowBuilder.menu()
          .setTitle('Choose Topping')
          .addItem('Cheese', WorkflowBuilder.message('✅ Medium Cheese Pizza - $12 ordered!'))
          .addItem('Pepperoni', WorkflowBuilder.message('✅ Medium Pepperoni Pizza - $13 ordered!'))
          .addItem('Hawaiian', WorkflowBuilder.message('✅ Medium Hawaiian Pizza - $13 ordered!'))
          .build()
        )
        .addItem('Large - $16', WorkflowBuilder.menu()
          .setTitle('Choose Topping')
          .addItem('Cheese', WorkflowBuilder.message('✅ Large Cheese Pizza - $16 ordered!'))
          .addItem('Pepperoni', WorkflowBuilder.message('✅ Large Pepperoni Pizza - $17 ordered!'))
          .addItem('Hawaiian', WorkflowBuilder.message('✅ Large Hawaiian Pizza - $17 ordered!'))
          .build()
        )
        .build()
      )
      .addItem('Track Order', WorkflowBuilder.action(async ({ api, threadID }) => {
        await api.sendMessageWithTyping('Checking order status...', threadID, 2000);
        await api.sendMessageAsync('📍 Your order is on the way! ETA: 15 minutes', threadID);
      }))
      .addItem('Contact Support', WorkflowBuilder.action(async ({ api, threadID }) => {
        await api.sendMessageAsync('📞 Support: 1-800-PIZZA\n📧 support@pizza.com', threadID);
      }))
      .build()
  },

  // Example 4: Admin menu với permission check
  {
    name: 'admin',
    permission: 1,
    description: 'Admin tools',
    workflow: WorkflowBuilder.menu()
      .setTitle('🔧 Admin Panel')
      .setFooter('Admin only commands')
      .addItem('User Management', WorkflowBuilder.menu()
        .setTitle('👥 User Management')
        .addItem('List Users', WorkflowBuilder.action(async ({ api, threadID }) => {
          const threadInfo = await api.getThreadInfoAsync(threadID);
          const count = threadInfo.participantIDs?.length || 0;
          await api.sendMessageAsync(`📊 Total users in thread: ${count}`, threadID);
        }))
        .addItem('Kick User', WorkflowBuilder.action(async ({ api, threadID }) => {
          await api.sendMessageAsync('Reply với user ID để kick', threadID);
        }))
        .addItem('Ban User', WorkflowBuilder.action(async ({ api, threadID }) => {
          await api.sendMessageAsync('Reply với user ID để ban', threadID);
        }))
        .build()
      )
      .addItem('Thread Settings', WorkflowBuilder.menu()
        .setTitle('⚙️ Thread Settings')
        .addItem('Change Name', WorkflowBuilder.action(async ({ api, threadID }) => {
          await api.sendMessageAsync('Reply với tên mới cho thread', threadID);
        }))
        .addItem('Change Color', WorkflowBuilder.action(async ({ api, threadID }) => {
          await api.sendMessageAsync('Reply với màu mới (red, blue, green...)', threadID);
        }))
        .addItem('Change Emoji', WorkflowBuilder.action(async ({ api, threadID }) => {
          await api.sendMessageAsync('Reply với emoji mới', threadID);
        }))
        .build()
      )
      .addItem('Bot Stats', WorkflowBuilder.action(async ({ api, threadID }) => {
        const stats = api.getStats();
        await api.sendMessageAsync(
          `📊 Bot Statistics:\n\n` +
          `Total API calls: ${stats.totalCalls}\n` +
          `Errors: ${stats.errors}\n` +
          `Error rate: ${stats.errorRate}\n` +
          `Uptime: ${Math.floor(stats.uptime / 1000)}s`,
          threadID
        );
      }))
      .build()
  },

  // Example 5: Game menu với reactions
  {
    name: 'game',
    permission: 0,
    description: 'Mini games',
    workflow: WorkflowBuilder.menu()
      .setTitle('🎮 Game Center')
      .setFooter('React để chọn game')
      .setMenuType('reaction')
      .addItem('🎲 Dice Roll', WorkflowBuilder.action(async ({ api, threadID }) => {
        const roll = Math.floor(Math.random() * 6) + 1;
        await api.sendMessageAsync(`🎲 You rolled: ${roll}!`, threadID);
      }))
      .addItem('🎰 Slot Machine', WorkflowBuilder.action(async ({ api, threadID }) => {
        const symbols = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎'];
        const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
        const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
        const slot3 = symbols[Math.floor(Math.random() * symbols.length)];
        const result = `${slot1} ${slot2} ${slot3}`;
        const win = slot1 === slot2 && slot2 === slot3;
        await api.sendMessageAsync(
          `🎰 ${result}\n\n${win ? '🎉 JACKPOT!' : '😔 Try again!'}`,
          threadID
        );
      }))
      .addItem('🎯 Coin Flip', WorkflowBuilder.action(async ({ api, threadID }) => {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        await api.sendMessageAsync(`🪙 ${result}!`, threadID);
      }))
      .build()
  },
];
