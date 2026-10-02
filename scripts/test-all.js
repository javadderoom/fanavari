const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const depts = await prisma.department.findMany();
  console.log('Departments in DB:', depts);
  const tools = await prisma.systemTool.findMany();
  console.log('Tools in DB:', tools);
  const procs = await prisma.process.findMany();
  console.log('Processes in DB:', procs);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
