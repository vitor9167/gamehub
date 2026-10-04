import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const games = [
    {
      title: "Test Game 01",
      slug: "test-game-01",
      description: "Jogo de teste para validação da paginação.",
      externalSource: "TEST",
      externalId: "test-01",
    },
    {
      title: "Test Game 02",
      slug: "test-game-02",
      description: "Jogo de teste para validação da paginação.",
      externalSource: "TEST",
      externalId: "test-02",
    },
    {
      title: "Test Game 03",
      slug: "test-game-03",
      description: "Jogo de teste para validação da paginação.",
      externalSource: "TEST",
      externalId: "test-03",
    },
    {
      title: "Test Game 04",
      slug: "test-game-04",
      description: "Jogo de teste para validação da paginação.",
      externalSource: "TEST",
      externalId: "test-04",
    },
    {
      title: "Test Game 05",
      slug: "test-game-05",
      description: "Jogo de teste para validação da paginação.",
      externalSource: "TEST",
      externalId: "test-05",
    },
    {
      title: "Test Game 06",
      slug: "test-game-06",
      description: "Jogo de teste para validação da paginação.",
      externalSource: "TEST",
      externalId: "test-06",
    },
  ];

  for (const game of games) {
    await prisma.game.upsert({
      where: {
        slug: game.slug,
      },
      update: {},
      create: game,
    });
  }

  console.log("6 jogos de teste adicionados com sucesso.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });