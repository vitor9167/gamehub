import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const user = await prisma.user.upsert({
    where: {
      email: "teste@gamehub.local",
    },

    update: {},

    create: {
      username: "usuario_teste",
      email: "teste@gamehub.local",
      passwordHash: "senha_teste_nao_usar_em_producao",
      displayName: "Usuário Teste",
    },
  });

  console.log("Usuário de teste criado:");
  console.log(user);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });