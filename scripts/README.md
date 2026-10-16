# Scripts Documentation

Auto-generate command, event, callback, plugin, and language files.

## Usage

### 1. Create Command

```bash
node scripts/createCommand.js <commandName> [--admin] [--description "..."]
```

**Examples:**
```bash
node scripts/createCommand.js hello
node scripts/createCommand.js ban --admin --description "Ban user from group"
```

**Output:** `plugins/<commandName>.js`
- Public command (permission: 0) by default
- Add `--admin` flag for admin-only command (permission: 1)

---

### 2. Create Menu Command

```bash
node scripts/createMenuCommand.js <commandName> <menuType> [--description "..."]
```

**Menu types:**
- `reply` - Reply-based menu (user replies with number)
- `reaction` - Reaction-based menu (user reacts with emoji)
- `paginated` - Paginated menu with next/prev navigation
- `confirm` - Confirmation dialog (yes/no)
- `form` - Multi-field form (collect multiple inputs)

**Examples:**
```bash
node scripts/createMenuCommand.js pizza reply --description "Pizza ordering menu"
node scripts/createMenuCommand.js settings reaction --description "Bot settings"
node scripts/createMenuCommand.js list paginated --description "Show all items"
node scripts/createMenuCommand.js delete confirm --description "Confirm deletion"
node scripts/createMenuCommand.js register form --description "User registration"
```

**Output:** `plugins/<commandName>.js`
- Interactive menu with callbacks
- Built-in error handling

---

### 3. Create Event

```bash
node scripts/createEvent.js <eventName> <eventType> [--description "..."]
```

**Event types:**
- `message` - New message sent
- `message_reply` - User replies to bot message
- `message_reaction` - User reacts to message
- `message_unsend` - User unsends message

**Examples:**
```bash
node scripts/createEvent.js onMessage message
node scripts/createEvent.js onReply message_reply --description "Handle message replies"
```

**Output:** `plugins/<eventName>.js`
- Listens for specific event type
- Triggered on every matching event

---

### 3. Create Callback

```bash
node scripts/createCallback.js <callbackName> <callbackType> [--description "..."]
```

**Callback types:**
- `reply` - Register callback for message reply
- `reaction` - Register callback for message reaction
- `unsend` - Register callback for message unsend

**Examples:**
```bash
node scripts/createCallback.js replyHandler reply
node scripts/createCallback.js reactionHandler reaction --description "Handle reactions"
```

**Output:** `plugins/<callbackName>.js`
- Command that sends message and registers callback
- Callback triggered when user replies/reacts/unsends

---

### 4. Create Full Plugin

```bash
node scripts/createPlugin.js <pluginName> <type> [options]
```

**Types:**
- `command` - Command with setup
- `event` - Event listener
- `callback` - Callback handler
- `full` - All features (command + event + callback)

**Options:**
- `--admin` - Admin-only command
- `--description "..."` - Plugin description
- `--eventType <type>` - Event type (for event/full)
- `--callbackType <type>` - Callback type (for callback/full)

**Examples:**
```bash
node scripts/createPlugin.js weather command --description "Get weather"
node scripts/createPlugin.js logger full --eventType message --description "Log all messages"
node scripts/createPlugin.js banHandler callback --callbackType reply
```

**Output:** `plugins/<pluginName>.js`

---

### 5. Create Language

```bash
node scripts/createLanguage.js <languageCode>
```

**Examples:**
```bash
node scripts/createLanguage.js es
node scripts/createLanguage.js fr
node scripts/createLanguage.js ja
```

**Output:** `lang/<languageCode>.lang`
- Template with all keys from `en.lang`
- Mark each value with `[TRANSLATE ME]`
- Translate and replace markers

---

## Workflow Example

### Create and test a new command:

1. Generate command scaffold:
```bash
node scripts/createCommand.js greet --description "Greet user"
```

2. Edit `plugins/greet.js`:
```javascript
module.exports.call = async (context) => {
  const { api, threadID, senderID, args } = context;
  const name = args[1] || 'friend';
  api.sendMessage(`Hello ${name}!`, threadID);
};
```

3. Restart bot: `npm start`

4. Test in chat: `!greet John`

---

### Create event listener:

1. Generate event:
```bash
node scripts/createEvent.js messageLogger message --description "Log every message"
```

2. Edit `plugins/messageLogger.js`:
```javascript
module.exports.event = ({ api, event }) => {
  console.log(`[${event.senderID}] ${event.body}`);
};
```

3. Restart bot

---

### Create callback handler:

1. Generate callback:
```bash
node scripts/createCallback.js survey reply --description "Send survey and collect replies"
```

2. Edit `plugins/survey.js` to customize survey logic

3. Users can reply and get feedback via callback

---

## File Structure After Generation

```
plugins/
├── ping.js (original)
├── greet.js (from createCommand)
├── messageLogger.js (from createEvent)
├── survey.js (from createCallback)
└── weather.js (from createPlugin)

lang/
├── en.lang
├── vi.lang
└── es.lang (from createLanguage)
```

---

## Tips

- Each plugin can have `call` (command), `event` (listener), or both
- Use `--admin` flag only for sensitive commands (ban, kick, etc.)
- Event plugins run on EVERY matching event (use `--description` to document)
- Callback plugins register handlers - user must interact (reply/react/unsend)
- Always translate language files completely before using
- Restart bot after creating new plugins: `npm start`

---

## Script Arguments Cheat Sheet

| Script | Args | Example |
|--------|------|---------|
| createCommand | name, [--admin], [--description] | `createCommand ban --admin --description "Ban user"` |
| createEvent | name, type, [--description] | `createEvent onMessage message --description "Log messages"` |
| createCallback | name, type, [--description] | `createCallback survey reply --description "Survey handler"` |
| createPlugin | name, type, [--admin], [--description], [--eventType], [--callbackType] | `createPlugin full full --eventType message` |
| createLanguage | code | `createLanguage es` |
