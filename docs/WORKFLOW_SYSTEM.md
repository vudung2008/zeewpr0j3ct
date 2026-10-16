# Workflow Command System

Hệ thống đăng ký command động với menu workflows, nested menus, callbacks.

---

## Overview

System cho phép tạo commands với interactive menus:
- User gọi command → Bot show menu
- User reply số hoặc react emoji → Thực thi action
- Support nested menus (menu trong menu)
- Support cả reply và reaction callbacks

---

## Workflow Types

### 1. Menu Workflow
Hiển thị menu với items, user chọn bằng reply/reaction.

### 2. Action Workflow
Thực thi function trực tiếp.

### 3. Message Workflow
Gửi message đơn giản.

---

## Quick Start

### 1. Định nghĩa workflow trong `plugins/workflows.js`

```javascript
const { WorkflowBuilder } = require('../src/bot/commandRegistry');

module.exports = [
  {
    name: 'shop',
    permission: 0,
    description: 'Shopping menu',
    workflow: WorkflowBuilder.menu()
      .setTitle('🛒 Shop')
      .setFooter('Reply với số')
      .addItem('Phones', WorkflowBuilder.action(async ({ api, threadID }) => {
        await api.sendMessageAsync('📱 iPhone, Samsung, ...', threadID);
      }))
      .addItem('Laptops', WorkflowBuilder.action(async ({ api, threadID }) => {
        await api.sendMessageAsync('💻 MacBook, Dell, ...', threadID);
      }))
      .build()
  }
];
```

### 2. Restart bot

```bash
npm start
```

### 3. Test in chat

```
User: !shop
Bot: 🛒 Shop

1. Phones
2. Laptops

Reply với số

User: 1
Bot: 📱 iPhone, Samsung, ...
```

---

## WorkflowBuilder API

### Menu Builder

```javascript
WorkflowBuilder.menu()
  .setTitle(title: string)           // Menu title
  .setFooter(footer: string)         // Footer text
  .setMenuType(type: 'reply' | 'reaction')  // Default: 'reply'
  .addItem(label: string, action)    // Add menu item
  .build()                           // Build workflow
```

### Action Builder

```javascript
WorkflowBuilder.action(async (context) => {
  // context: { api, event, threadID, senderID, messageID, ... }
  await api.sendMessageAsync('Hello!', threadID);
})
```

### Message Builder

```javascript
WorkflowBuilder.message('Simple text message')
```

---

## Examples

### Example 1: Simple Reply Menu

```javascript
{
  name: 'help',
  permission: 0,
  description: 'Help menu',
  workflow: WorkflowBuilder.menu()
    .setTitle('📖 Help Menu')
    .addItem('Commands', WorkflowBuilder.message('Available commands: !help, !shop, !game'))
    .addItem('About', WorkflowBuilder.message('Bot version 1.0.0'))
    .addItem('Contact', WorkflowBuilder.message('Email: support@bot.com'))
    .build()
}
```

**Output:**
```
📖 Help Menu

1. Commands
2. About
3. Contact
```

User replies: `1` → Bot sends command list

---

### Example 2: Reaction Menu

```javascript
{
  name: 'quick',
  permission: 0,
  description: 'Quick actions',
  workflow: WorkflowBuilder.menu()
    .setTitle('⚡ Quick Actions')
    .setMenuType('reaction')
    .addItem('Check Time', WorkflowBuilder.action(async ({ api, threadID }) => {
      const now = new Date().toLocaleTimeString();
      await api.sendMessageAsync(`🕐 Current time: ${now}`, threadID);
    }))
    .addItem('Check Date', WorkflowBuilder.action(async ({ api, threadID }) => {
      const today = new Date().toLocaleDateString();
      await api.sendMessageAsync(`📅 Today: ${today}`, threadID);
    }))
    .build()
}
```

**Output:**
```
⚡ Quick Actions

👍 Check Time
❤️ Check Date
```

User reacts: ❤️ → Bot sends current date

---

### Example 3: Nested Menu

```javascript
{
  name: 'food',
  permission: 0,
  description: 'Food ordering',
  workflow: WorkflowBuilder.menu()
    .setTitle('🍔 Food Menu')
    .addItem('Pizza', WorkflowBuilder.menu()
      .setTitle('🍕 Pizza Menu')
      .addItem('Margherita', WorkflowBuilder.message('✅ Margherita ordered!'))
      .addItem('Pepperoni', WorkflowBuilder.message('✅ Pepperoni ordered!'))
      .addItem('Hawaiian', WorkflowBuilder.message('✅ Hawaiian ordered!'))
      .build()
    )
    .addItem('Burger', WorkflowBuilder.menu()
      .setTitle('🍔 Burger Menu')
      .addItem('Cheeseburger', WorkflowBuilder.message('✅ Cheeseburger ordered!'))
      .addItem('Bacon Burger', WorkflowBuilder.message('✅ Bacon Burger ordered!'))
      .build()
    )
    .build()
}
```

**Flow:**
1. User: `!food`
2. Bot: Shows main menu (Pizza, Burger)
3. User: `1` (selects Pizza)
4. Bot: Shows pizza submenu (Margherita, Pepperoni, Hawaiian)
5. User: `2` (selects Pepperoni)
6. Bot: `✅ Pepperoni ordered!`

---

### Example 4: Deep Nested Menu (3 levels)

```javascript
{
  name: 'electronics',
  permission: 0,
  description: 'Electronics store',
  workflow: WorkflowBuilder.menu()
    .setTitle('📱 Electronics')
    .addItem('Phones', WorkflowBuilder.menu()
      .setTitle('📱 Phone Brands')
      .addItem('Apple', WorkflowBuilder.menu()
        .setTitle('🍎 iPhone Models')
        .addItem('iPhone 15 Pro', WorkflowBuilder.message('💰 $999'))
        .addItem('iPhone 15', WorkflowBuilder.message('💰 $799'))
        .addItem('iPhone 14', WorkflowBuilder.message('💰 $699'))
        .build()
      )
      .addItem('Samsung', WorkflowBuilder.menu()
        .setTitle('📱 Samsung Models')
        .addItem('Galaxy S24', WorkflowBuilder.message('💰 $899'))
        .addItem('Galaxy S23', WorkflowBuilder.message('💰 $799'))
        .build()
      )
      .build()
    )
    .build()
}
```

Level 1 → Level 2 → Level 3 → Final action

---

### Example 5: Dynamic Action với API

```javascript
{
  name: 'profile',
  permission: 0,
  description: 'User profile',
  workflow: WorkflowBuilder.menu()
    .setTitle('👤 Profile Menu')
    .addItem('View Profile', WorkflowBuilder.action(async ({ api, threadID, senderID }) => {
      // Get user info from API
      const userInfo = await api.getUserInfoAsync(senderID);
      const user = userInfo[senderID];
      
      await api.sendMessageAsync(
        `👤 Profile:\n\nName: ${user.name}\nGender: ${user.gender || 'N/A'}`,
        threadID
      );
    }))
    .addItem('Thread Info', WorkflowBuilder.action(async ({ api, threadID }) => {
      // Get thread info
      const threadInfo = await api.getThreadInfoAsync(threadID);
      const memberCount = threadInfo.participantIDs?.length || 0;
      
      await api.sendMessageAsync(
        `💬 Thread:\n\nName: ${threadInfo.threadName || 'N/A'}\nMembers: ${memberCount}`,
        threadID
      );
    }))
    .build()
}
```

---

### Example 6: Mix Reply và Reaction Menus

```javascript
{
  name: 'mixed',
  permission: 0,
  description: 'Mixed menu types',
  workflow: WorkflowBuilder.menu()
    .setTitle('🔀 Main Menu')
    .setMenuType('reply')  // First level: reply
    .addItem('Quick Actions', WorkflowBuilder.menu()
      .setTitle('⚡ Quick Actions')
      .setMenuType('reaction')  // Second level: reaction
      .addItem('Action 1', WorkflowBuilder.message('✅ Done!'))
      .addItem('Action 2', WorkflowBuilder.message('✅ Done!'))
      .build()
    )
    .addItem('Settings', WorkflowBuilder.menu()
      .setTitle('⚙️ Settings')
      .setMenuType('reply')  // Second level: reply
      .addItem('Option 1', WorkflowBuilder.message('✅ Set!'))
      .addItem('Option 2', WorkflowBuilder.message('✅ Set!'))
      .build()
    )
    .build()
}
```

---

### Example 7: Admin Menu với Permission

```javascript
{
  name: 'admin',
  permission: 1,  // Admin only
  description: 'Admin panel',
  workflow: WorkflowBuilder.menu()
    .setTitle('🔧 Admin Panel')
    .addItem('Kick User', WorkflowBuilder.action(async ({ api, threadID }) => {
      await api.sendMessageAsync('Reply with user ID to kick', threadID);
    }))
    .addItem('Ban User', WorkflowBuilder.action(async ({ api, threadID }) => {
      await api.sendMessageAsync('Reply with user ID to ban', threadID);
    }))
    .addItem('Stats', WorkflowBuilder.action(async ({ api, threadID }) => {
      const stats = api.getStats();
      await api.sendMessageAsync(`📊 Stats: ${stats.totalCalls} calls`, threadID);
    }))
    .build()
}
```

Chỉ admin mới gọi được `!admin`

---

## Context Object

Callback actions nhận context object:

```javascript
{
  api,              // Enhanced API object
  event,            // Current event
  threadID,         // Thread ID
  senderID,         // Sender ID
  messageID,        // Message ID
  selectedItem,     // Selected menu item
  selectedChoice,   // Choice number (1-indexed)
  selectedReaction, // Reaction emoji (reaction menus only)
  // ... original context
}
```

---

## Advanced Patterns

### Pattern 1: Confirmation Before Action

```javascript
.addItem('Delete All', WorkflowBuilder.menu()
  .setTitle('⚠️ Confirm Delete?')
  .addItem('Yes, delete', WorkflowBuilder.action(async ({ api, threadID }) => {
    // Perform deletion
    await api.sendMessageAsync('✅ Deleted!', threadID);
  }))
  .addItem('No, cancel', WorkflowBuilder.message('❌ Cancelled'))
  .build()
)
```

---

### Pattern 2: Loop Back to Main Menu

```javascript
const mainMenu = WorkflowBuilder.menu()
  .setTitle('🏠 Main Menu')
  .addItem('Option 1', WorkflowBuilder.menu()
    .setTitle('Option 1 Details')
    .addItem('Action', WorkflowBuilder.message('Done!'))
    .addItem('Back to Main', mainMenu.build())  // Loop back
    .build()
  )
  .build();
```

---

### Pattern 3: Collect Input After Selection

```javascript
.addItem('Send Message', WorkflowBuilder.action(async ({ api, threadID }) => {
  const info = await api.sendMessageAsync('Reply with your message:', threadID);
  
  api.handlerReply(info.messageID, async ({ api, event }) => {
    const userMessage = event.body;
    await api.sendMessageAsync(`You said: ${userMessage}`, event.threadID);
  });
}))
```

---

### Pattern 4: Multi-step Workflow

```javascript
.addItem('Register', WorkflowBuilder.action(async ({ api, threadID }) => {
  const responses = {};
  
  // Step 1: Ask name
  const msg1 = await api.sendMessageAsync('Step 1: Enter your name', threadID);
  api.handlerReply(msg1.messageID, async ({ api, event }) => {
    responses.name = event.body;
    
    // Step 2: Ask email
    const msg2 = await api.sendMessageAsync('Step 2: Enter your email', event.threadID);
    api.handlerReply(msg2.messageID, async ({ api, event }) => {
      responses.email = event.body;
      
      // Complete
      await api.sendMessageAsync(
        `✅ Registered!\nName: ${responses.name}\nEmail: ${responses.email}`,
        event.threadID
      );
    });
  });
}))
```

---

## Best Practices

1. **Keep menu items concise** - Max 50 chars per label
2. **Limit items per menu** - Max 10 for reply, max 9 for reaction
3. **Use nested menus** - Break complex menus into submenu categories
4. **Provide feedback** - Always confirm user actions
5. **Handle errors** - Wrap async actions in try-catch
6. **Use typing indicators** - For actions that take time
7. **Clear titles** - Explain what each menu does
8. **Permission check** - Use `permission: 1` for admin-only commands

---

## Testing

Test workflows defined in `commands/workflows.js`:

```bash
!shop       # Shopping menu (nested, 3 levels)
!settings   # Settings (reaction menu)
!pizza      # Pizza ordering (nested with dynamic data)
!admin      # Admin panel (permission: 1)
!game       # Game center (reaction menu with random)
```

---

## Programmatic Registration

Register workflows in code:

```javascript
module.exports.setup = ({ api, client }) => {
  client.commandRegistry.register({
    name: 'custom',
    permission: 0,
    description: 'Custom command',
    workflow: WorkflowBuilder.menu()
      .setTitle('Custom Menu')
      .addItem('Item 1', WorkflowBuilder.message('Hello!'))
      .build()
  });
};
```

---

## Unregister Command

```javascript
client.commandRegistry.unregister('shop');
```

---

## List All Workflows

```javascript
const workflows = client.commandRegistry.list();
console.log(workflows); // ['shop', 'settings', 'pizza', 'admin', 'game']
```

---

## File Structure

```
plugins/
  workflows.js          # Workflow definitions
  workflow-loader.js    # Auto-load workflows on startup
  ping.js              # Example simple command
  apitest.js           # Example API command
  menu.js              # Example menu builders

src/bot/
  commandRegistry.js    # CommandRegistry & WorkflowBuilder
  menuBuilder.js        # MenuBuilder, PaginatedMenuBuilder, etc.
```

**Giải thích:**
- **plugins/** - Tất cả commands (traditional plugins + workflows)
- **Traditional plugins** (ping.js, apitest.js) - Export `config` + `call()`
- **Workflow commands** (workflows.js) - Declarative workflow definitions
- **workflow-loader.js** - Auto-register workflows khi bot start

---

## Error Handling

Errors automatically logged:

```javascript
WorkflowBuilder.action(async ({ api, threadID }) => {
  throw new Error('Something wrong');
  // Bot sends: "Error: Something wrong"
})
```

---

## Performance

- Callbacks stored in-memory
- No database overhead
- Instant menu response
- Each workflow independent

---

## Limitations

- Reply menus: max 10 items
- Reaction menus: max 9 items (emoji limit)
- No timeout on callbacks (manual cleanup needed)
- No pagination built-in (use PaginatedMenuBuilder for large lists)
