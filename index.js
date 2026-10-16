const { bootstrap } = require('./src/app');

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
