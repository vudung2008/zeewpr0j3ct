const { runCommand } = require('./commandRunner');
const { createHandlers } = require('./handlers');

function createListener({ api, client, callbackRegistry }) {
  const handlers = createHandlers(callbackRegistry);

  return () => {
    api.listenMqtt((err, event) => {
      if (err) {
        client.logger(`Error api.listen: ${err}`, 'error');
        return;
      }

      if (!event) return;

      if (event.type === 'message') {
        runCommand({ api, event, client }).catch((error) => {
          client.logger(`Message handling failed: ${error.stack || error.message}`, 'error');
        });
      } else if (handlers[event.type]) {
        try {
          handlers[event.type]({ api, event });
        } catch (error) {
          client.logger(`Callback handling failed: ${error.stack || error.message}`, 'error');
        }
      }

      for (const item of client.events || []) {
        if (item.type === event.type) {
          Promise.resolve()
            .then(() => item.run({ api, event }))
            .catch((error) => {
              client.logger(`Event ${event.type} failed: ${error.stack || error.message}`, 'error');
            });
        }
      }
    });
  };
}

module.exports = { createListener };
