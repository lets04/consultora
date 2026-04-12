import { createApp } from './app.js';
import { config } from './config.js';
import { prisma } from './lib/prisma.js';

async function main() {
  await prisma.$connect();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`innova-server http://localhost:${config.port}`);
  });
}

main().catch((e) => {
  console.error(e);
  void prisma.$disconnect();
  process.exit(1);
});
