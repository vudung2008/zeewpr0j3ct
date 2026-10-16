# Project Workflow

Tài liệu này mô tả chi tiết quy trình hoạt động của zeewpr0j3ct từ khởi động đến xử lý event.

## 1. Startup Flow

### 1.1 Entry Point: `index.js`

```javascript
const { bootstrap } = require('./src/app');

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

**Nhiệm vụ:**
- Import module `bootstrap` từ `src/app.js`
- Gọi `bootstrap()` và xử lý lỗi
- Exit process nếu bootstrap thất bại

---

### 1.2 Bootstrap Process: `src/app.js`

#### Step 1: Load Configuration

```javascript
const config = require('./config');
```

**Quá trình:**
- Đọc `.env` file qua `dotenv.config()`
- Fallback sang `config/main.config.json`
- Parse các giá trị (boolean, list, JSON object)
- Return object `config` với keys: `DEVMODE`, `APPSTATEPATH`, `PREFIX`, `LANGUAGE`, `FCAOPTION`, `MongoDB`, `ADMINID`

---

#### Step 2: Load Language

```javascript
const language = loadLanguage(config.LANGUAGE);
```

**Quá trình:**
- Tìm file `lang/{LANGUAGE}.lang` hoặc fallback sang `lang/en.lang`
- Parse từng dòng dạng `key=value`
- Bỏ qua comment (bắt đầu bằng `#`)
- Return object `language` với các key-value pair

---

#### Step 3: Initialize Client Object

```javascript
const client = {
  config,
  language,
  getText: createTranslator(language),
  logger,
  commands: new Map(),
  events: [],
  callbacks: createCallbackRegistry(logger),
};
```

**Thành phần:**
- `config` - Cấu hình ứng dụng
- `language` - Bản dịch
- `getText` - Hàm dịch text
- `logger` - Hàm log
- `commands` - Map lưu các command plugins
- `events` - Array lưu các event listeners
- `callbacks` - Registry quản lý reply/reaction/unsend callbacks

---

#### Step 4: Connect Database

```javascript
await connectDatabase();
```

**Quá trình:**
- Nếu `config.MongoDB` trống: skip (chỉ log warning)
- Nếu có URI: dùng Mongoose connect
- Nếu lỗi: log error nhưng không crash

---

#### Step 5: Start Bot

```javascript
startBot(client);
```

**Quá trình chi tiết:**
1. Check appstate file tồn tại
2. Đọc appstate JSON (remove BOM nếu cần)
3. Call `login()` từ `@dongdev/fca-unofficial`
4. Khi login thành công:
   - Attach callback API: `api.handlerReply`, `api.handlerReaction`, `api.handlerUnsend`
   - Load plugins từ `plugins/` directory
   - Start MQTT listener

---

## 2. Configuration Loading

### 2.1 Hierarchy (cao nhất -> thấp nhất)

```
1. Environment variables (process.env.*)
2. JSON config file (config/main.config.json)
3. Hard-coded defaults
```

### 2.2 Example Config Flow

```javascript
// Ví dụ: PREFIX
const PREFIX = process.env.PREFIX || defaultConfig.PREFIX || '!';
```

**Scenario 1:** Env có `PREFIX=!cmd` → dùng `!cmd`
**Scenario 2:** Env rỗng, JSON có `PREFIX=!` → dùng `!`
**Scenario 3:** Cả hai rỗng → dùng default `!`

### 2.3 Special Parsing

**Boolean:**
```javascript
DEVMODE: parseBoolean(process.env.DEVMODE, Boolean(defaultConfig.DEVMODE))
```
Chỉ nhận `'true'` (case-insensitive), mặc định `false`

**List:**
```javascript
ADMINID: parseList(process.env.ADMINID || defaultConfig.ADMINID || [])
```
Split bằng `,`, trim, filter empty, convert to string

**FCA Options:**
```javascript
FCAOPTION: parseFcaOption(process.env.FCAOPTION, defaultConfig.FCAOPTION || {...})
```
Parse JSON từ env, fallback sang JSON config, fallback sang defaults

---

## 3. Plugin Loading

### 3.1 Discovery Phase

**Location:** `plugins/` directory

**Pattern:** Lấy toàn bộ `.js` file trừ `example` file

```javascript
const files = fs.readdirSync(pluginDir)
  .filter((file) => file.endsWith('.js') && !file.includes('example'));
```

### 3.2 Validation Phase

Mỗi plugin phải exports object với:

```javascript
module.exports.config = {
  name: 'unique-name',
  permission: 0,  // 0 = public, 1 = admin
  // optional
  description: '...',
  version: '1.0.0',
};
```

**Validation:**
- Bỏ qua nếu không có `config` hoặc `config.name`
- Log warning nếu plugin invalid

### 3.3 Optional Hooks

```javascript
module.exports.setup = ({ api, client }) => {
  // Chạy khi plugin được load
};

module.exports.call = async (context) => {
  // Command handler
  // context: { api, messageID, threadID, senderID, message, body, args, isGroup, command }
};

module.exports.event = ({ api, event }) => {
  // Event handler
  // Được gọi cho mọi event type nếu tuyên bố trong config.type
};
```

### 3.4 Registration Phase

**Command plugins:**
```javascript
if (plugin.call && !client.commands.has(plugin.config.name)) {
  client.commands.set(plugin.config.name, plugin);
}
```

**Event plugins:**
```javascript
if (plugin.event && plugin.config.type) {
  client.events.push({ type: plugin.config.type, run: plugin.event });
}
```

### 3.5 Error Handling

- Nếu `setup()` fail: log error, nhưng plugin vẫn được register
- Nếu `call()` fail: log error, command không execute
- Nếu `event()` fail: log error, event processing tiếp tục

---

## 4. Event Processing Flow

### 4.1 MQTT Listener

**Setup:** `src/bot/listener.js`

```javascript
api.listenMqtt((err, event) => {
  // Xử lý event từ Facebook
});
```

**Event object:**
```javascript
{
  type: 'message' | 'message_reply' | 'message_reaction' | 'message_unsend',
  senderID: '...',
  threadID: '...',
  messageID: '...',
  body: '...',
  // ... other fields
}
```

### 4.2 Event Routing

```javascript
if (event.type === 'message') {
  runCommand({ api, event, client }).catch(err => {...});
} else if (handlers[event.type]) {
  handlers[event.type]({ api, event });
}

// Chạy plugin event listeners
for (const item of client.events || []) {
  if (item.type === event.type) {
    Promise.resolve()
      .then(() => item.run({ api, event }))
      .catch(err => {...});
  }
}
```

### 4.3 Event Types

| Type | Handler | Plugin |
|------|---------|--------|
| `message` | `runCommand()` | Có thể lắng nghe |
| `message_reply` | `handlers.message_reply()` | Có thể lắng nghe |
| `message_reaction` | `handlers.message_reaction()` | Có thể lắng nghe |
| `message_unsend` | `handlers.message_unsend()` | Có thể lắng nghe |
| Other | Plugin only | Có thể lắng nghe |

---

## 5. Command Dispatch

### 5.1 Parse Command

**Input:** `event.body = "!ping hello world"`

**Step 1: Extract prefix**
```javascript
const prefix = client.config.PREFIX || '!';
const message = String(event.body || '');
if (!message.startsWith(prefix)) return;
```
Result: Command có prefix → continue

**Step 2: Split arguments**
```javascript
const args = message.slice(prefix.length).trim().split(/\s+/).filter(Boolean);
// args = ['ping', 'hello', 'world']
```

**Step 3: Get command name**
```javascript
const commandName = args[0];  // 'ping'
const command = client.commands.get(commandName);
if (!command) return;  // Command không tồn tại
```

### 5.2 Permission Check

**Check DEVMODE:**
```javascript
if (client.config.DEVMODE && !client.config.ADMINID.includes(event.senderID)) {
  return;  // Block non-admin nếu DEVMODE bật
}
```

**Check Command Permission:**
```javascript
const permissionRequired = Number(command.config?.permission || 0);
if (permissionRequired !== 0) {
  const info = await api.getThreadInfo(event.threadID);
  const adminIDs = Array.isArray(info?.adminIDs) ? info.adminIDs : [];
  const isAdmin = adminIDs.includes(event.senderID) || 
                  client.config.ADMINID.includes(event.senderID);
  if (!isAdmin) return;
}
```

### 5.3 Build Context

```javascript
const commandContext = {
  api,
  messageID: event.messageID,
  threadID: event.threadID,
  senderID: event.senderID,
  message: event,
  body: event.body,
  args: ['ping', 'hello', 'world'],
  isGroup: !!event.isGroup,
  command,
};
```

### 5.4 Execute Command

```javascript
try {
  await command.call(commandContext);
} catch (error) {
  client.logger(`Command ${commandName} failed: ${error.stack || error.message}`, 'error');
}
```

---

## 6. Callback Registry

### 6.1 Register Callback

**Plugin example:**
```javascript
api.handlerReply(messageID, ({ api, event }) => {
  console.log('User replied to my message:', event.body);
});
```

**Internally:**
```javascript
function register(type, messageID, callback) {
  if (typeof callback !== 'function') {
    logger('The input parameter must be a function!', 'error');
    return;
  }
  registries[type].set(String(messageID), callback);
}

api.handlerReply = (messageID, callback) => register('reply', messageID, callback);
api.handlerReaction = (messageID, callback) => register('reaction', messageID, callback);
api.handlerUnsend = (messageID, callback) => register('unsend', messageID, callback);
```

### 6.2 Handle Callback Event

**When user replies:**
```
Event received: type='message_reply', messageReply.messageID='msg-123'
↓
handlers.message_reply() called
↓
callbackRegistry.handle('reply', 'msg-123', { api, event })
↓
Find callback in registries.reply.get('msg-123')
↓
Execute callback
↓
Delete from registries.reply
```

**Built-in handlers:**

```javascript
// src/bot/handlers.js
message_reply({ api, event }) {
  if (event?.messageReply?.messageID) {
    callbackRegistry.handle('reply', event.messageReply.messageID, { api, event });
  }
}

message_reaction({ api, event }) {
  if (event?.messageID) {
    callbackRegistry.handle('reaction', event.messageID, { api, event });
  }
}

message_unsend({ api, event }) {
  if (event?.messageID) {
    callbackRegistry.handle('unsend', event.messageID, { api, event });
  }
}
```

---

## 7. Internationalization (i18n)

### 7.1 Language Files

**Format:** `lang/{LANGUAGE}.lang`

```
# Comments start with #
greeting=Hello $1, welcome to $2!
command_not_found=Command "$1" not found
error_prefix=[ ERROR ] »
```

### 7.2 Load Language

```javascript
function loadLanguage(languageName) {
  const target = `lang/${languageName}.lang`;
  const fallback = 'lang/en.lang';
  const filePath = fs.existsSync(target) ? target : fallback;
  
  // Parse file and return { key: value, ... }
}
```

### 7.3 Translate

```javascript
const getText = createTranslator(language);

// Usage:
getText('greeting', 'Ada', 'the bot');
// → 'Hello Ada, welcome to the bot!'
```

**Internally:**
```javascript
function createTranslator(language) {
  return (key, ...args) => {
    if (!language[key]) throw new Error(`Not found key language: ${key}`);
    
    return args.reduce(
      (text, value, index) => text.replace(`$${index + 1}`, String(value)),
      language[key]
    );
  };
}
```

---

## 8. Error Handling Strategy

### 8.1 Levels

| Level | Strategy | Recovery |
|-------|----------|----------|
| Startup | Try-catch, log, exit | Manual restart |
| Config load | Log warning, use default | Continue with defaults |
| Plugin load | Log error, skip plugin | Other plugins work |
| Command exec | Try-catch, log error | User can retry |
| Event process | Promise.catch, log | Continue listening |
| DB connection | Log warning, skip | App works without DB |

### 8.2 Error Flow Example: Command Fails

```
User sends: !ping
↓
runCommand() called
↓
command.call() throws Error
↓
try-catch block catches it
↓
logger(`Command ping failed: ...`, 'error')
↓
Message handling complete, listener continues
```

### 8.3 Error Flow Example: Plugin Load Fails

```
Plugin discovery finds: ping.js, myPlugin.js
↓
Load ping.js → success, register
↓
Load myPlugin.js → error in setup()
↓
Catch error, log: "Cannot run plugin setup myPlugin: ..."
↓
myPlugin still registers (config/call loaded before setup)
↓
Continue with next plugin
```

---

## 9. Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Start: npm start                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ index.js: bootstrap()       │
        └────────────────┬────────────┘
                         │
      ┌──────────────────┼──────────────────┐
      │                  │                  │
      ▼                  ▼                  ▼
  Load Config       Load i18n          Create Client
  (src/config.js)   (src/i18n.js)      Object
      │                  │                  │
      └──────────────────┼──────────────────┘
                         │
                         ▼
            ┌─────────────────────────────┐
            │ Connect Database            │
            │ (src/database/connection.js)│
            └─────────────┬───────────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │ Login to Facebook           │
            │ (@dongdev/fca-unofficial)   │
            └─────────────┬───────────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │ Load Plugins                │
            │ (src/bot/pluginRegistry.js) │
            └─────────────┬───────────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │ Start MQTT Listener         │
            │ (src/bot/listener.js)       │
            │ → Ready to receive events   │
            └─────────────┬───────────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │ 2. Event Loop               │
            │ Waiting for MQTT events...  │
            └─────────────┬───────────────┘
                          │
            ┌─────────────┴────────────────┐
            │                              │
            ▼                              ▼
     ┌────────────────┐          ┌──────────────────┐
     │ message event  │          │ callback event   │
     │ (reply/unsend/ │          │ (reply/reaction/ │
     │  reaction)     │          │  unsend)         │
     └────────┬───────┘          └────────┬─────────┘
              │                           │
              ▼                           ▼
      ┌─────────────────┐      ┌─────────────────────┐
      │ runCommand()    │      │ handlers[type]()    │
      │ - Parse args    │      │ - Get callback from │
      │ - Check perm    │      │   registry          │
      │ - Execute       │      │ - Execute callback  │
      └─────┬───────────┘      │ - Delete from reg   │
            │                  └────────┬────────────┘
            │                           │
            └───────────────┬───────────┘
                            │
                            ▼
                  ┌────────────────────────┐
                  │ Plugin event listeners │
                  │ (if registered)        │
                  └────────────────────────┘
```

---

## 10. Example: Complete Message Flow

**Scenario:** User sends `!ping hello` in group chat

### Step-by-step execution:

1. **Facebook sends MQTT event**
   ```javascript
   {
     type: 'message',
     senderID: '100001234567890',
     threadID: '8758510670923358',
     messageID: 'mid.123456',
     body: '!ping hello',
     isGroup: true,
   }
   ```

2. **Listener receives event**
   ```javascript
   api.listenMqtt((err, event) => {
     // event.type === 'message'
   })
   ```

3. **Route to command runner**
   ```javascript
   if (event.type === 'message') {
     runCommand({ api, event, client });
   }
   ```

4. **Parse command**
   ```
   prefix: '!'
   args: ['ping', 'hello']
   commandName: 'ping'
   ```

5. **Check permissions**
   ```
   command.config.permission = 0 (public)
   → Skip permission check, allow
   ```

6. **Build context**
   ```javascript
   commandContext = {
     api,
     threadID: '8758510670923358',
     senderID: '100001234567890',
     messageID: 'mid.123456',
     args: ['ping', 'hello'],
     isGroup: true,
   }
   ```

7. **Execute command**
   ```javascript
   await command.call(commandContext);
   // plugins/ping.js: api.sendMessage('Pong!', threadID, messageID)
   ```

8. **Send response**
   ```
   Facebook receives: sendMessage('Pong!', '8758510670923358', 'mid.123456')
   → Send "Pong!" in group thread as reply to user's message
   ```

9. **Continue listening**
   ```
   Listener waits for next event
   ```

---

## 11. Testing

### 11.1 Test Coverage

**Covered:**
- Command context building
- Command execution (public)
- Command permission check (admin-only)
- Callback registry (register, handle, error)
- i18n (placeholder replacement, missing key)

**Run tests:**
```bash
npm test
```

### 11.2 Test Files

- `test/commandRunner.test.js` - Command parsing & permission
- `test/callbackRegistry.test.js` - Callback registration & execution
- `test/i18n.test.js` - Translation & error handling

---

## 12. Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Appstate file not found" | `APPSTATEPATH` wrong | Check path, copy appstate outside repo |
| Command not recognized | Plugin not loaded | Check `plugins/` folder, restart |
| Permission denied | Not admin in config | Add your ID to `ADMINID` in `.env` |
| "Cannot find module" | Missing dependency | Run `npm install` |
| Bot doesn't respond | FCA login failed | Check appstate freshness, re-login |
| Event not triggering | Plugin event type mismatch | Check `config.type` in plugin |

---

## 13. Development Checklist

### Adding New Command

1. Create `plugins/myCommand.js`
2. Export `config` with `name`, `permission`, optionally `description`, `version`
3. Export `call(context)` async function
4. Optional: export `setup({ api, client })`
5. Restart bot: `npm start`
6. Test: send `!myCommand` in chat

### Adding New Event Listener

1. In `plugins/myPlugin.js`, export:
   ```javascript
   config = { name: '...', type: 'message' }
   event = ({ api, event }) => { ... }
   ```
2. Restart bot
3. Event will trigger on every `message` event

### Creating Language File

1. Create `lang/es.lang` (for Spanish)
2. Add key-value pairs:
   ```
   greeting=Hola $1, bienvenido a $2!
   ```
3. Set `LANGUAGE=es` in `.env`
4. Restart bot

---

## 14. Architecture Notes

### Why This Design?

- **Modularity:** Each concern isolated → easy to test/modify
- **No globals:** All state in `client` object → predictable, testable
- **Error safety:** Try-catch everywhere → bot keeps running
- **Plugin system:** Extensible without modifying core
- **Callback registry:** Decouple event source from handler
- **i18n:** Support multiple languages easily

### When to Refactor?

- More than 5 plugins → consider plugin folder structure
- Multiple DB models → add `src/models/` folder
- Need metrics → add `src/services/metrics.js`
- Need queues → add `src/services/queue.js`
- Rate limiting needed → add `src/middleware/rateLimiter.js`
