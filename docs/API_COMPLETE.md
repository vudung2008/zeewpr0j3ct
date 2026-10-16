# API Reference

Tổng hợp tất cả API methods có sẵn trong bot.

---

## API Sources

### 1. Facebook Chat API (@dongdev/fca-unofficial)
**Location:** `DocumentsAPI.md`

Original API từ package, documented đầy đủ.

### 2. Enhanced API Wrapper
**Location:** `src/bot/apiWrapper.js`

Custom methods và promisified versions.

### 3. Menu Builder API
**Location:** `src/bot/menuBuilder.js`

Interactive menu builders.

### 4. Command Registry API
**Location:** `src/bot/commandRegistry.js`

Dynamic command registration.

---

## Facebook Chat API (Original)

### Message APIs

| Method | Description | Documented |
|--------|-------------|------------|
| `api.sendMessage(message, threadID, callback, messageID)` | Send message | ✅ DocumentsAPI.md |
| `api.sendTypingIndicator(threadID, callback)` | Show typing | ✅ DocumentsAPI.md |
| `api.markAsRead(threadID, callback)` | Mark as read | ✅ DocumentsAPI.md |
| `api.markAsDelivered(threadID, callback)` | Mark delivered | ✅ DocumentsAPI.md |
| `api.markAsReadAll(callback)` | Mark all read | ✅ DocumentsAPI.md |
| `api.setMessageReaction(reaction, messageID, callback)` | React to message | ✅ DocumentsAPI.md |
| `api.unsendMessage(messageID, callback)` | Unsend message | ✅ DocumentsAPI.md |
| `api.deleteMessage(messageID, callback)` | Delete message | ✅ DocumentsAPI.md |
| `api.forwardAttachment(attachmentID, userOrUsers, callback)` | Forward attachment | ✅ DocumentsAPI.md |

### Thread/Group APIs

| Method | Description | Documented |
|--------|-------------|------------|
| `api.getThreadInfo(threadID, callback)` | Get thread info | ✅ DocumentsAPI.md |
| `api.getThreadList(limit, timestamp, tags, callback)` | List threads | ✅ DocumentsAPI.md |
| `api.getThreadHistory(threadID, amount, timestamp, callback)` | Get history | ✅ DocumentsAPI.md |
| `api.getThreadPictures(threadID, offset, limit, callback)` | Get pictures | ✅ DocumentsAPI.md |
| `api.changeThreadColor(color, threadID, callback)` | Change color | ✅ DocumentsAPI.md |
| `api.changeThreadEmoji(emoji, threadID, callback)` | Change emoji | ✅ DocumentsAPI.md |
| `api.setTitle(newTitle, threadID, callback)` | Set title | ✅ DocumentsAPI.md |
| `api.changeGroupImage(image, threadID, callback)` | Change image | ✅ DocumentsAPI.md |
| `api.changeNickname(nickname, threadID, participantID, callback)` | Change nickname | ✅ DocumentsAPI.md |
| `api.muteThread(threadID, muteSeconds, callback)` | Mute thread | ✅ DocumentsAPI.md |
| `api.changeArchivedStatus(threadID, archive, callback)` | Archive thread | ✅ DocumentsAPI.md |
| `api.deleteThread(threadOrThreads, callback)` | Delete thread | ✅ DocumentsAPI.md |
| `api.searchForThread(name, callback)` | Search thread | ✅ DocumentsAPI.md |

### User APIs

| Method | Description | Documented |
|--------|-------------|------------|
| `api.getUserInfo(userID, callback)` | Get user info | ✅ DocumentsAPI.md |
| `api.getUserID(name, callback)` | Get user ID by name | ✅ DocumentsAPI.md |
| `api.getCurrentUserID()` | Get bot's user ID | ✅ DocumentsAPI.md |
| `api.getFriendsList(callback)` | Get friends list | ✅ DocumentsAPI.md |
| `api.addUserToGroup(userID, threadID, callback)` | Add user to group | ✅ DocumentsAPI.md |
| `api.removeUserFromGroup(userID, threadID, callback)` | Remove user | ✅ DocumentsAPI.md |
| `api.changeAdminStatus(threadID, adminIDs, adminStatus, callback)` | Change admin | ✅ DocumentsAPI.md |
| `api.changeBlockedStatus(userID, block, callback)` | Block/unblock user | ✅ DocumentsAPI.md |

### Misc APIs

| Method | Description | Documented |
|--------|-------------|------------|
| `api.listen(callback)` | Listen for events | ✅ DocumentsAPI.md |
| `api.listenMqtt(callback)` | Listen MQTT (recommended) | ✅ DocumentsAPI.md |
| `api.logout(callback)` | Logout | ✅ DocumentsAPI.md |
| `api.getAppState()` | Get app state | ✅ DocumentsAPI.md |
| `api.setOptions(options)` | Set options | ✅ DocumentsAPI.md |
| `api.createPoll(title, threadID, options, callback)` | Create poll | ✅ DocumentsAPI.md |
| `api.handleMessageRequest(threadID, accept, callback)` | Handle request | ✅ DocumentsAPI.md |
| `api.getEmojiUrl(emoji, size, callback)` | Get emoji URL | ✅ DocumentsAPI.md |
| `api.resolvePhotoUrl(photoID, callback)` | Resolve photo URL | ✅ DocumentsAPI.md |
| `api.threadColors` | Available thread colors | ✅ DocumentsAPI.md |

---

## Enhanced API Wrapper (Custom)

**Location:** `src/bot/apiWrapper.js`

### Promisified Methods

| Method | Original | Description |
|--------|----------|-------------|
| `api.sendMessageAsync(message, threadID, messageID)` | `sendMessage` | ✅ Custom |
| `api.getUserInfoAsync(userIDs)` | `getUserInfo` | ✅ Custom |
| `api.getThreadInfoAsync(threadID)` | `getThreadInfo` | ✅ Custom |
| `api.markAsReadAsync(threadID)` | `markAsRead` | ✅ Custom |
| `api.setMessageReactionAsync(reaction, messageID, threadID)` | `setMessageReaction` | ✅ Custom |
| `api.unsendMessageAsync(messageID)` | `unsendMessage` | ✅ Custom |
| `api.changeThreadColorAsync(color, threadID)` | `changeThreadColor` | ✅ Custom |
| `api.changeThreadEmojiAsync(emoji, threadID)` | `changeThreadEmoji` | ✅ Custom |
| `api.addUserToGroupAsync(userID, threadID)` | `addUserToGroup` | ✅ Custom |
| `api.removeUserFromGroupAsync(userID, threadID)` | `removeUserFromGroup` | ✅ Custom |
| `api.changeAdminStatusAsync(threadID, adminIDs, status)` | `changeAdminStatus` | ✅ Custom |
| `api.createPollAsync(title, threadID, options)` | `createPoll` | ✅ Custom |

### Custom Utility Methods

| Method | Description | Source |
|--------|-------------|--------|
| `api.sendTypingForDuration(threadID, duration)` | Show typing for duration | ✅ apiWrapper.js |
| `api.sendMessageWithTyping(message, threadID, duration)` | Type then send | ✅ apiWrapper.js |
| `api.reply(message, threadID, messageID, callback)` | Quick reply | ✅ apiWrapper.js |
| `api.replyAsync(message, threadID, messageID)` | Async reply | ✅ apiWrapper.js |
| `api.getStats()` | API call statistics | ✅ apiWrapper.js |
| `api.isUserAdmin(userID, threadID)` | Check if user is admin | ✅ apiWrapper.js |
| `api.isBotAdmin(threadID)` | Check if bot is admin | ✅ apiWrapper.js |

### Custom Callback Handlers

**Location:** `src/bot/callbackRegistry.js`

| Method | Description | Source |
|--------|-------------|--------|
| `api.handlerReply(messageID, callback)` | Register reply callback | ✅ callbackRegistry.js |
| `api.handlerReaction(messageID, callback)` | Register reaction callback | ✅ callbackRegistry.js |
| `api.handlerUnsend(messageID, callback)` | Register unsend callback | ✅ callbackRegistry.js |

---

## Menu Builder API

**Location:** `src/bot/menuBuilder.js`

### MenuBuilder

```javascript
const { MenuBuilder } = require('../src/bot/menuBuilder');

new MenuBuilder(api, threadID)
  .setTitle(title)
  .setFooter(footer)
  .setType('reply' | 'reaction')
  .addItem(label, callback)
  .send()
```

**Defined in:** `src/bot/menuBuilder.js` ✅

### PaginatedMenuBuilder

```javascript
const { PaginatedMenuBuilder } = require('../src/bot/menuBuilder');

new PaginatedMenuBuilder(api, threadID)
  .setTitle(title)
  .setPageSize(size)
  .addItems(items)
  .send()
```

**Defined in:** `src/bot/menuBuilder.js` ✅

### ConfirmationBuilder

```javascript
const { ConfirmationBuilder } = require('../src/bot/menuBuilder');

new ConfirmationBuilder(api, threadID)
  .setMessage(message)
  .onConfirm(callback)
  .onCancel(callback)
  .send()
```

**Defined in:** `src/bot/menuBuilder.js` ✅

### FormBuilder

```javascript
const { FormBuilder } = require('../src/bot/menuBuilder');

new FormBuilder(api, threadID)
  .setTitle(title)
  .addField(name, label, validator)
  .onComplete(callback)
  .send()
```

**Defined in:** `src/bot/menuBuilder.js` ✅

---

## Command Registry API

**Location:** `src/bot/commandRegistry.js`

### CommandRegistry

```javascript
client.commandRegistry.register(config)
client.commandRegistry.unregister(name)
client.commandRegistry.list()
```

**Defined in:** `src/bot/commandRegistry.js` ✅

### WorkflowBuilder

```javascript
const { WorkflowBuilder } = require('../src/bot/commandRegistry');

WorkflowBuilder.menu()
  .setTitle(title)
  .setFooter(footer)
  .setMenuType('reply' | 'reaction')
  .addItem(label, action)
  .build()

WorkflowBuilder.action(handler)
WorkflowBuilder.message(content)
```

**Defined in:** `src/bot/commandRegistry.js` ✅

---

## API Methods NOT in DocumentsAPI.md

These are custom additions:

### From apiWrapper.js
- `sendMessageAsync()` - Promisified sendMessage
- `getUserInfoAsync()` - Promisified getUserInfo
- `getThreadInfoAsync()` - Promisified getThreadInfo
- `markAsReadAsync()` - Promisified markAsRead
- `setMessageReactionAsync(reaction, messageID, threadID)` - Promisified setMessageReaction, threadID optional for context
- `unsendMessageAsync()` - Promisified unsendMessage
- `changeThreadColorAsync()` - Promisified changeThreadColor
- `changeThreadEmojiAsync()` - Promisified changeThreadEmoji
- `addUserToGroupAsync()` - Promisified addUserToGroup
- `removeUserFromGroupAsync()` - Promisified removeUserFromGroup
- `changeAdminStatusAsync()` - Promisified changeAdminStatus
- `createPollAsync()` - Promisified createPoll
- `sendTypingForDuration()` - Custom utility
- `sendMessageWithTyping()` - Custom utility
- `reply()` - Custom utility
- `replyAsync()` - Custom utility
- `getStats()` - Custom utility
- `isUserAdmin()` - Custom utility
- `isBotAdmin()` - Custom utility

### From callbackRegistry.js
- `handlerReply()` - Custom callback registration
- `handlerReaction()` - Custom callback registration
- `handlerUnsend()` - Custom callback registration

### From menuBuilder.js
- `MenuBuilder` - Custom menu builder
- `PaginatedMenuBuilder` - Custom paginated menu
- `ConfirmationBuilder` - Custom confirmation dialog
- `FormBuilder` - Custom form builder

### From commandRegistry.js
- `CommandRegistry` - Custom command registry
- `WorkflowBuilder` - Custom workflow builder

---

## Summary

| Category | Count | Source |
|----------|-------|--------|
| Facebook Chat API (Original) | 40+ | DocumentsAPI.md |
| Promisified Methods | 12 | src/bot/apiWrapper.js |
| Custom Utilities | 7 | src/bot/apiWrapper.js |
| Callback Handlers | 3 | src/bot/callbackRegistry.js |
| Menu Builders | 4 | src/bot/menuBuilder.js |
| Command Registry | 2 | src/bot/commandRegistry.js |
| **Total** | **68+** | Multiple sources |

---

## Quick Reference by Use Case

### Send Messages
- `api.sendMessage()` - Basic send
- `api.sendMessageAsync()` - Promise version
- `api.sendMessageWithTyping()` - With typing indicator
- `api.reply()` - Quick reply

### Get Information
- `api.getUserInfo()` / `api.getUserInfoAsync()` - User info
- `api.getThreadInfo()` / `api.getThreadInfoAsync()` - Thread info
- `api.getCurrentUserID()` - Bot's ID

### Interactive Menus
- `MenuBuilder` - Reply/reaction menus
- `PaginatedMenuBuilder` - Large lists
- `ConfirmationBuilder` - Yes/no dialogs
- `FormBuilder` - Multi-field forms

### Callbacks
- `api.handlerReply()` - Reply callback
- `api.handlerReaction()` - Reaction callback
- `api.handlerUnsend()` - Unsend callback

### Admin Actions
- `api.isUserAdmin()` - Check admin
- `api.changeAdminStatus()` - Promote/demote
- `api.removeUserFromGroup()` - Kick user

### Thread Management
- `api.changeThreadColor()` - Change color
- `api.changeThreadEmoji()` - Change emoji
- `api.setTitle()` - Change name

---

## Documentation Locations

- **Facebook Chat API**: [DocumentsAPI.md](F:\zeewpr0j3ct\DocumentsAPI.md)
- **API Wrapper**: [docs/API_WRAPPER.md](F:\zeewpr0j3ct\docs\API_WRAPPER.md)
- **Menu Builder**: [docs/MENU_BUILDER.md](F:\zeewpr0j3ct\docs\MENU_BUILDER.md)
- **Workflow System**: [docs/WORKFLOW_SYSTEM.md](F:\zeewpr0j3ct\docs\WORKFLOW_SYSTEM.md)
