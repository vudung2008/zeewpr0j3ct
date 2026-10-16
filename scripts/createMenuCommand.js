#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (!args[0]) {
  console.error('Usage: node scripts/createMenuCommand.js <commandName> <menuType> [--description "..."]');
  console.error('Menu types: reply, reaction, paginated, confirm, form');
  process.exit(1);
}

const commandName = args[0];
const menuType = args[1] || 'reply';
const descIdx = args.indexOf('--description');
const description = descIdx !== -1 ? args[descIdx + 1] : `${commandName} menu command`;

const pluginPath = path.join(__dirname, '../plugins', `${commandName}.js`);

if (fs.existsSync(pluginPath)) {
  console.error(`Command "${commandName}" already exists!`);
  process.exit(1);
}

const templates = {
  reply: `const { MenuBuilder } = require('../src/bot/menuBuilder');

module.exports.config = {
  name: '${commandName}',
  permission: 0,
  description: '${description}',
  version: '1.0.0',
};

module.exports.call = async (context) => {
  const { api, threadID } = context;

  try {
    const menu = new MenuBuilder(api, threadID)
      .setTitle('📋 ${commandName} Menu')
      .setFooter('Reply with your choice')
      .addItem('Option 1', async ({ api, event, label }) => {
        await api.sendMessageAsync(\`You selected: \${label}\`, event.threadID, event.messageID);
      })
      .addItem('Option 2', async ({ api, event, label }) => {
        await api.sendMessageAsync(\`You selected: \${label}\`, event.threadID, event.messageID);
      })
      .addItem('Option 3', async ({ api, event, label }) => {
        await api.sendMessageAsync(\`You selected: \${label}\`, event.threadID, event.messageID);
      });

    await menu.send();
  } catch (error) {
    await api.sendMessageAsync(\`Error: \${error.message}\`, threadID);
  }
};
`,
  reaction: `const { MenuBuilder } = require('../src/bot/menuBuilder');

module.exports.config = {
  name: '${commandName}',
  permission: 0,
  description: '${description}',
  version: '1.0.0',
};

module.exports.call = async (context) => {
  const { api, threadID } = context;

  try {
    const menu = new MenuBuilder(api, threadID)
      .setTitle('⚙️ ${commandName} Settings')
      .setFooter('React to select')
      .setType('reaction')
      .addItem('Enable feature', async ({ api, event, reaction }) => {
        await api.sendMessageAsync(\`✅ Enabled with \${reaction}\`, event.threadID);
      })
      .addItem('Disable feature', async ({ api, event, reaction }) => {
        await api.sendMessageAsync(\`❌ Disabled with \${reaction}\`, event.threadID);
      })
      .addItem('Check status', async ({ api, event, reaction }) => {
        await api.sendMessageAsync(\`📊 Status checked with \${reaction}\`, event.threadID);
      });

    await menu.send();
  } catch (error) {
    await api.sendMessageAsync(\`Error: \${error.message}\`, threadID);
  }
};
`,
  paginated: `const { PaginatedMenuBuilder } = require('../src/bot/menuBuilder');

module.exports.config = {
  name: '${commandName}',
  permission: 0,
  description: '${description}',
  version: '1.0.0',
};

module.exports.call = async (context) => {
  const { api, threadID } = context;

  try {
    // Generate items (replace with your data)
    const items = [];
    for (let i = 1; i <= 20; i++) {
      items.push({
        label: \`Item \${i}\`,
        callback: async ({ api, event, label }) => {
          await api.sendMessageAsync(\`You selected: \${label}\`, event.threadID, event.messageID);
        }
      });
    }

    const menu = new PaginatedMenuBuilder(api, threadID)
      .setTitle('📚 ${commandName} List')
      .setPageSize(5)
      .addItems(items);

    await menu.send();
  } catch (error) {
    await api.sendMessageAsync(\`Error: \${error.message}\`, threadID);
  }
};
`,
  confirm: `const { ConfirmationBuilder } = require('../src/bot/menuBuilder');

module.exports.config = {
  name: '${commandName}',
  permission: 0,
  description: '${description}',
  version: '1.0.0',
};

module.exports.call = async (context) => {
  const { api, threadID } = context;

  try {
    const confirmation = new ConfirmationBuilder(api, threadID)
      .setMessage('⚠️ Are you sure you want to proceed?')
      .onConfirm(async ({ api, event }) => {
        await api.sendMessageAsync('✅ Confirmed!', event.threadID, event.messageID);
      })
      .onCancel(async ({ api, event }) => {
        await api.sendMessageAsync('❌ Cancelled', event.threadID, event.messageID);
      });

    await confirmation.send();
  } catch (error) {
    await api.sendMessageAsync(\`Error: \${error.message}\`, threadID);
  }
};
`,
  form: `const { FormBuilder } = require('../src/bot/menuBuilder');

module.exports.config = {
  name: '${commandName}',
  permission: 0,
  description: '${description}',
  version: '1.0.0',
};

module.exports.call = async (context) => {
  const { api, threadID } = context;

  try {
    const form = new FormBuilder(api, threadID)
      .setTitle('📝 ${commandName} Form')
      .addField('field1', 'Enter field 1:', (value) => value.length >= 2)
      .addField('field2', 'Enter field 2:', (value) => value.length >= 2)
      .addField('field3', 'Enter field 3:', (value) => value.length >= 2)
      .onComplete(async ({ api, responses }) => {
        await api.sendMessageAsync(
          \`✅ Form Complete!\\n\\n\` +
          \`Field 1: \${responses.field1}\\n\` +
          \`Field 2: \${responses.field2}\\n\` +
          \`Field 3: \${responses.field3}\`,
          threadID
        );
      });

    await form.send();
  } catch (error) {
    await api.sendMessageAsync(\`Error: \${error.message}\`, threadID);
  }
};
`,
};

if (!templates[menuType]) {
  console.error(`Invalid menu type. Must be: reply, reaction, paginated, confirm, form`);
  process.exit(1);
}

fs.writeFileSync(pluginPath, templates[menuType]);
console.log(`✓ Created ${menuType} menu command: ${pluginPath}`);
