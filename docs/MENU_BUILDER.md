# Menu Builder Documentation

Hệ thống tạo interactive menu với reply/reaction callbacks.

---

## Features

1. **MenuBuilder** - Reply hoặc reaction-based menu
2. **PaginatedMenuBuilder** - Menu với pagination
3. **ConfirmationBuilder** - Yes/No dialog
4. **FormBuilder** - Multi-field form với validation

---

## 1. MenuBuilder

Tạo menu với reply số hoặc reaction emoji.

### Reply Menu

```javascript
const { MenuBuilder } = require('../src/bot/menuBuilder');

const menu = new MenuBuilder(api, threadID)
  .setTitle('🍕 Pizza Menu')
  .setFooter('Reply with your choice number')
  .addItem('Margherita - $10', async ({ api, event, label }) => {
    await api.sendMessageAsync(`You ordered: ${label}`, event.threadID);
  })
  .addItem('Pepperoni - $12', async ({ api, event, label }) => {
    await api.sendMessageAsync(`You ordered: ${label}`, event.threadID);
  })
  .addItem('Hawaiian - $11', async ({ api, event, label }) => {
    await api.sendMessageAsync(`You ordered: ${label}`, event.threadID);
  });

await menu.send();
```

**Output:**
```
🍕 Pizza Menu

1. Margherita - $10
2. Pepperoni - $12
3. Hawaiian - $11

Reply with your choice number
```

User replies: `2` → Callback triggered với label "Pepperoni - $12"

---

### Reaction Menu

```javascript
const menu = new MenuBuilder(api, threadID)
  .setTitle('⚙️ Settings')
  .setType('reaction')
  .addItem('Enable notifications', async ({ api, event, reaction }) => {
    await api.sendMessageAsync(`Enabled with ${reaction}`, event.threadID);
  })
  .addItem('Disable notifications', async ({ api, event, reaction }) => {
    await api.sendMessageAsync(`Disabled with ${reaction}`, event.threadID);
  });

await menu.send();
```

**Output:**
```
⚙️ Settings

👍 Enable notifications
❤️ Disable notifications
```

User reacts: ❤️ → Callback triggered cho "Disable notifications"

**Available reactions:** 👍, ❤️, 😆, 😮, 😢, 😠, 👏, 🔥, 💯 (max 9 items)

---

### API Reference

#### `MenuBuilder(api, threadID)`
Constructor.

#### `.setTitle(title: string)`
Set menu title.

#### `.setFooter(footer: string)`
Set menu footer text.

#### `.setType(type: 'reply' | 'reaction')`
Set menu type. Default: `'reply'`

#### `.addItem(label: string, callback: function)`
Add menu item.

**Callback parameters:**
- `api` - API object
- `event` - Event object
- `choice` - Item number (1-indexed)
- `label` - Item label
- `reaction` - Reaction emoji (reaction menu only)

#### `.send()`
Send menu and register callbacks. Returns Promise<messageInfo>

---

## 2. PaginatedMenuBuilder

Menu với nhiều items, có next/prev navigation.

```javascript
const { PaginatedMenuBuilder } = require('../src/bot/menuBuilder');

const items = [];
for (let i = 1; i <= 20; i++) {
  items.push({
    label: `Item ${i}`,
    callback: async ({ api, event, label }) => {
      await api.sendMessageAsync(`Selected: ${label}`, event.threadID);
    }
  });
}

const menu = new PaginatedMenuBuilder(api, threadID)
  .setTitle('📚 All Items')
  .setPageSize(5)
  .addItems(items);

await menu.send();
```

**Output (Page 1):**
```
📚 All Items

1. Item 1
2. Item 2
3. Item 3
4. Item 4
5. Item 5

📄 Page 1/4
Reply: number (select) | "next" | "prev"
```

User replies:
- `2` → Select Item 2
- `next` → Go to page 2
- `prev` → Go to previous page

---

### API Reference

#### `PaginatedMenuBuilder(api, threadID)`
Constructor.

#### `.setTitle(title: string)`
Set menu title.

#### `.setPageSize(size: number)`
Set items per page. Default: 5

#### `.addItems(items: Array<{label, callback}>)`
Add multiple items at once.

#### `.send()`
Send menu. Returns Promise<messageInfo>

---

## 3. ConfirmationBuilder

Yes/No confirmation dialog.

```javascript
const { ConfirmationBuilder } = require('../src/bot/menuBuilder');

const confirmation = new ConfirmationBuilder(api, threadID)
  .setMessage('⚠️ Delete all messages?')
  .onConfirm(async ({ api, event }) => {
    await api.sendMessageAsync('✅ Deleted!', event.threadID);
  })
  .onCancel(async ({ api, event }) => {
    await api.sendMessageAsync('❌ Cancelled', event.threadID);
  });

await confirmation.send();
```

**Output:**
```
⚠️ Delete all messages?

✅ Yes
❌ No

Reply: yes/no
```

User replies: `yes`, `y`, `ok`, `confirm` → onConfirm
User replies: `no`, `n`, `cancel` → onCancel

---

### API Reference

#### `ConfirmationBuilder(api, threadID)`
Constructor.

#### `.setMessage(message: string)`
Set confirmation message.

#### `.setConfirmText(text: string)`
Custom confirm text. Default: `'✅ Yes'`

#### `.setCancelText(text: string)`
Custom cancel text. Default: `'❌ No'`

#### `.onConfirm(callback: function)`
Set confirm callback.

#### `.onCancel(callback: function)`
Set cancel callback.

#### `.send()`
Send confirmation. Returns Promise<messageInfo>

---

## 4. FormBuilder

Collect multiple inputs với validation.

```javascript
const { FormBuilder } = require('../src/bot/menuBuilder');

const form = new FormBuilder(api, threadID)
  .setTitle('📝 Registration')
  .addField('name', 'What is your name?', (value) => value.length >= 2)
  .addField('age', 'What is your age?', (value) => {
    const age = parseInt(value);
    return !isNaN(age) && age >= 13 && age <= 100;
  })
  .addField('email', 'What is your email?', (value) => value.includes('@'))
  .onComplete(async ({ api, responses }) => {
    await api.sendMessageAsync(
      `✅ Registration Complete!\n` +
      `Name: ${responses.name}\n` +
      `Age: ${responses.age}\n` +
      `Email: ${responses.email}`,
      threadID
    );
  });

await form.send();
```

**Flow:**
1. Bot: "📝 Registration\n\nWhat is your name? (1/3)"
2. User: "John"
3. Bot: "📝 Registration\n\nWhat is your age? (2/3)"
4. User: "25"
5. Bot: "📝 Registration\n\nWhat is your email? (3/3)"
6. User: "john@example.com"
7. Bot calls `onComplete` với responses: `{ name: 'John', age: '25', email: 'john@example.com' }`

---

### API Reference

#### `FormBuilder(api, threadID)`
Constructor.

#### `.setTitle(title: string)`
Set form title (shown on every field).

#### `.addField(name: string, label: string, validator?: function)`
Add form field.

**Validator function:**
- Input: field value (string)
- Return: `true` (valid) hoặc `false` (invalid)
- If invalid, bot asks again

#### `.onComplete(callback: function)`
Set completion callback.

**Callback parameters:**
- `api` - API object
- `responses` - Object với field names as keys

#### `.send()`
Start form flow.

---

## Advanced Examples

### Nested Menus

```javascript
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
      });
    
    await combatMenu.send();
  })
  .addItem('🎒 Inventory', async ({ api, event }) => {
    await api.sendMessageAsync('Opening inventory...', event.threadID);
  });

await mainMenu.send();
```

---

### Dynamic Menu with API Data

```javascript
const userInfo = await api.getUserInfoAsync(senderID);
const user = userInfo[senderID];

const menu = new MenuBuilder(api, threadID)
  .setTitle(`👤 ${user.name}'s Profile`)
  .addItem('View Stats', async ({ api, event }) => {
    await api.sendMessageAsync(`Name: ${user.name}`, event.threadID);
  })
  .addItem('Edit Profile', async ({ api, event }) => {
    // Show edit form
  });

await menu.send();
```

---

### Form with Complex Validation

```javascript
const form = new FormBuilder(api, threadID)
  .setTitle('💳 Payment Info')
  .addField('cardNumber', 'Card number (16 digits):', (value) => {
    return /^\d{16}$/.test(value);
  })
  .addField('expiry', 'Expiry date (MM/YY):', (value) => {
    const match = value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    
    const month = parseInt(match[1]);
    return month >= 1 && month <= 12;
  })
  .addField('cvv', 'CVV (3 digits):', (value) => {
    return /^\d{3}$/.test(value);
  })
  .onComplete(async ({ api, responses }) => {
    // Process payment
    await api.sendMessageAsync('✅ Payment processed', threadID);
  });

await form.send();
```

---

## Error Handling

Tất cả callbacks tự động wrapped với try-catch:

```javascript
.addItem('Option', async ({ api, event }) => {
  throw new Error('Something went wrong');
  // Bot sends: "Error: Something went wrong"
});
```

Manual error handling:

```javascript
.addItem('Option', async ({ api, event }) => {
  try {
    // Your code
  } catch (error) {
    await api.sendMessageAsync(`Custom error: ${error.message}`, event.threadID);
  }
});
```

---

## Best Practices

1. **Keep menu items concise** - Max 50 chars per label
2. **Limit items** - Reply menu: max 10 items, Reaction menu: max 9
3. **Use pagination** - For >10 items
4. **Validate form inputs** - Always provide validators
5. **Handle errors** - Wrap async operations in try-catch
6. **Clear titles** - Explain what menu does
7. **Provide feedback** - Confirm user actions

---

## Testing

Test all menu types với `!menu` command:

```bash
!menu reply        # Reply-based menu
!menu reaction     # Reaction-based menu
!menu paginated    # Paginated menu
!menu confirm      # Confirmation dialog
!menu form         # Form example
!menu nested       # Nested menus
!menu dynamic      # Dynamic menu
```

---

## NPM Scripts

Generate menu commands:

```bash
npm run create:menu pizza reply
npm run create:menu settings reaction
npm run create:menu items paginated
npm run create:menu delete confirm
npm run create:menu register form
```
