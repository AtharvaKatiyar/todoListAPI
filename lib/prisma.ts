import 'dotenv/config';
import {PrismaClient} from '../generated/prisma/';
import {PrismaPg} from '@prisma/adapter-pg';
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL is not set. Set it in your environment or a .env file.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };