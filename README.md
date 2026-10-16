# zeewpr0j3ct

A modular Facebook Messenger bot built with Node.js and
`@dongdev/fca-unofficial`.

## Requirements

- Node.js 18 or newer
- A valid Facebook appstate file
- A MongoDB URI only if database features are enabled

## Setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Copy [.env.example](./.env.example) to `.env`.
3. Put the appstate file outside the repository, then set `APPSTATEPATH`
   to its absolute or workspace-relative path.
4. Set `MONGODB_URI` if MongoDB is required.
5. Set `ADMINID` to a comma-separated list of administrator IDs.

Do not commit `.env` or appstate files. They contain credentials and session
data.

## Commands

```text
!ping
```

Plugins are loaded from [plugins/](./plugins). A command plugin exports:

- `config.name`
- `config.permission`
- `call(context)`

Optional `setup({ api, client })` and event handlers are also supported.

## Development

```powershell
npm test
npm run check
npm start
```

The test suite uses Node's built-in test runner and covers command dispatch,
permission checks, callbacks, and translations.

## Project layout

```text
src/
  app.js                 Application bootstrap
  config.js              Environment and JSON configuration
  i18n.js                Language file loading and translation
  logger.js              Console logger
  bot/
    commandRunner.js     Command parsing and authorization
    listener.js          MQTT event routing
    pluginRegistry.js    Plugin discovery and registration
    callbackRegistry.js  Reply/reaction/unsend callbacks
    handlers.js          Built-in callback event handlers
  database/
    connection.js        MongoDB connection
plugins/                 Bot plugins
lang/                    Translations
test/                    Automated tests
```

## Dependency audit

The Facebook API dependency currently brings vulnerable transitive packages.
Do not run `npm audit fix --force` blindly: the available fix is a major
downgrade of the API package and may break login/runtime behavior. Review the
API client migration separately before changing it.
