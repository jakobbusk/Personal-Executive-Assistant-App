import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      timezone: 'America/New_York',
      emailPreferences: { daily: true, weekly: true },
      scheduleConfig: { dailyTime: '07:00', weeklyTime: '18:00' },
    },
  });

  await prisma.rssFeed.upsert({
    where: { userId_url: { userId: user.id, url: 'https://feeds.feedburner.com/TechCrunch' } },
    update: {},
    create: {
      userId: user.id,
      url: 'https://feeds.feedburner.com/TechCrunch',
      title: 'TechCrunch',
      category: 'Technology',
    },
  });

  await prisma.rssFeed.upsert({
    where: { userId_url: { userId: user.id, url: 'https://hnrss.org/frontpage' } },
    update: {},
    create: {
      userId: user.id,
      url: 'https://hnrss.org/frontpage',
      title: 'Hacker News',
      category: 'Technology',
    },
  });

  console.log('Seed complete. Demo user:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
