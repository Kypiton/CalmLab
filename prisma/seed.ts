import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
});

const userData: Prisma.UserCreateInput[] = [
	{
		firstName: "Dan",
		lastName: 'Glushchenko',
		email: "testemail@gmail.com",
		password: 'qwerty123'

	},
	{
		firstName: "Alex",
		lastName: 'Semenov',
		email: "alexo@gmail.com",
		password: 'zxcvb123'

	},
];

export async function main() {
	for (const u of userData) {
		await prisma.user.create({ data: u });
	}
}

main();