const { MenuBuilder, PaginatedMenuBuilder, ConfirmationBuilder, FormBuilder } = require('../src/bot/menuBuilder');

module.exports.config = {
  name: 'menu',
  permission: 0,
  description: 'Interactive menu examples',
  version: '1.0.0',
};

module.exports.call = async (context) => {
  const { api, threadID, senderID, args } = context;

  const action = args[1] || 'help';

  try {
    switch (action) {
      case 'reply':
        // Reply-based menu
        const replyMenu = new MenuBuilder(api, threadID)
          .setTitle('🍕 Pizza Menu')
          .setFooter('Reply with your choice number')
          .addItem('Margherita - $10', async ({ api, event, label }) => {
            await api.sendMessageAsync(`You selected: ${label}`, event.threadID);
          })
          .addItem('Pepperoni - $12', async ({ api, event, label }) => {
            await api.sendMessageAsync(`You selected: ${label}`, event.threadID);
          })
          .addItem('Hawaiian - $11', async ({ api, event, label }) => {
            await api.sendMessageAsync(`You selected: ${label}`, event.threadID);
          });
        
        await replyMenu.send();
        break;

      case 'reaction':
        // Reaction-based menu
        const reactionMenu = new MenuBuilder(api, threadID)
          .setTitle('⚙️ Bot Settings')
          .setFooter('React to select an option')
          .setType('reaction')
          .addItem('Enable notifications', async ({ api, event, reaction }) => {
            await api.sendMessageAsync(`✅ Notifications enabled`, event.threadID);
          })
          .addItem('Disable notifications', async ({ api, event, reaction }) => {
            await api.sendMessageAsync(`❌ Notifications disabled`, event.threadID);
          })
          .addItem('Check status', async ({ api, event, reaction }) => {
            await api.sendMessageAsync(`📊 Status: Active`, event.threadID);
          });
        
        await reactionMenu.send();
        break;

      case 'paginated':
        // Paginated menu
        const items = [];
        for (let i = 1; i <= 20; i++) {
          items.push({
            label: `Item ${i} - Option ${i}`,
            callback: async ({ api, event, label }) => {
              await api.sendMessageAsync(`You selected: ${label}`, event.threadID);
            }
          });
        }

        const paginatedMenu = new PaginatedMenuBuilder(api, threadID)
          .setTitle('📚 All Items')
          .setPageSize(5)
          .addItems(items);
        
        await paginatedMenu.send();
        break;

      case 'confirm':
        // Confirmation dialog
        const confirmation = new ConfirmationBuilder(api, threadID)
          .setMessage('⚠️ Are you sure you want to delete all messages?')
          .onConfirm(async ({ api, event }) => {
            await api.sendMessageAsync('✅ Confirmed! Deleting...', event.threadID);
          })
          .onCancel(async ({ api, event }) => {
            await api.sendMessageAsync('❌ Cancelled', event.threadID);
          });
        
        await confirmation.send();
        break;

      case 'form':
        // Form with multiple fields
        const form = new FormBuilder(api, threadID)
          .setTitle('📝 User Registration')
          .addField('name', 'What is your name?', (value) => value.length >= 2)
          .addField('age', 'What is your age?', (value) => !isNaN(value) && parseInt(value) >= 13)
          .addField('email', 'What is your email?', (value) => value.includes('@'))
          .onComplete(async ({ api, responses }) => {
            await api.sendMessageAsync(
              `✅ Registration Complete!\n\n` +
              `Name: ${responses.name}\n` +
              `Age: ${responses.age}\n` +
              `Email: ${responses.email}`,
              threadID
            );
          });
        
        await form.send();
        break;

      case 'nested':
        // Nested menu (menu inside menu)
        const mainMenu = new MenuBuilder(api, threadID)
          .setTitle('🎮 Game Menu')
          .addItem('⚔️ Combat', async ({ api, event }) => {
            const combatMenu = new MenuBuilder(api, event.threadID)
              .setTitle('⚔️ Combat Options')
              .addItem('Attack', async ({ api, event }) => {
                await api.sendMessageAsync('You attacked! 💥', event.threadID);
              })
              .addItem('Defend', async ({ api, event }) => {
                await api.sendMessageAsync('You defended! 🛡️', event.threadID);
              })
              .addItem('Run', async ({ api, event }) => {
                await api.sendMessageAsync('You ran away! 🏃', event.threadID);
              });
            
            await combatMenu.send();
          })
          .addItem('🎒 Inventory', async ({ api, event }) => {
            await api.sendMessageAsync('Opening inventory... 🎒', event.threadID);
          })
          .addItem('⚙️ Settings', async ({ api, event }) => {
            await api.sendMessageAsync('Opening settings... ⚙️', event.threadID);
          });
        
        await mainMenu.send();
        break;

      case 'dynamic':
        // Dynamic menu with API data
        const userInfo = await api.getUserInfoAsync(senderID);
        const user = userInfo[senderID];
        
        const dynamicMenu = new MenuBuilder(api, threadID)
          .setTitle(`👤 Profile: ${user.name}`)
          .addItem('View Stats', async ({ api, event }) => {
            await api.sendMessageAsync(
              `📊 Your Stats:\nName: ${user.name}\nGender: ${user.gender || 'N/A'}`,
              event.threadID
            );
          })
          .addItem('Edit Profile', async ({ api, event }) => {
            await api.sendMessageAsync('Opening editor...', event.threadID);
          });
        
        await dynamicMenu.send();
        break;

      default:
        await api.sendMessageAsync(
          '📋 Menu Examples:\n\n' +
          '!menu reply - Reply-based menu\n' +
          '!menu reaction - Reaction-based menu\n' +
          '!menu paginated - Paginated menu (20 items)\n' +
          '!menu confirm - Confirmation dialog\n' +
          '!menu form - Multi-field form\n' +
          '!menu nested - Nested menu\n' +
          '!menu dynamic - Dynamic menu with API data',
          threadID
        );
    }
  } catch (error) {
    await api.sendMessageAsync(`Error: ${error.message}`, threadID);
  }
};
