import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

// ✅ PostgreSQL connection
if (!process.env.POSTGRES_URL) {
  throw new Error('❌ POSTGRES_URL is not defined in environment');
}
const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

// 👤 Seed Users
async function seedUsers(sql: postgres.Sql) {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await sql`
      INSERT INTO users (id, name, email, password)
      VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
}

// 👥 Seed Customers
async function seedCustomers(sql: postgres.Sql) {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  for (const customer of customers) {
    await sql`
      INSERT INTO customers (id, name, email, image_url)
      VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
}

// 🧾 Seed Invoices
async function seedInvoices(sql: postgres.Sql) {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  for (const invoice of invoices) {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
}

// 💰 Seed Revenue
async function seedRevenue(sql: postgres.Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  for (const rev of revenue) {
    await sql`
      INSERT INTO revenue (month, revenue)
      VALUES (${rev.month}, ${rev.revenue})
      ON CONFLICT (month) DO NOTHING;
    `;
  }
}

// 🌱 GET handler for seeding
export async function GET() {
  try {
    console.log('🔄 Starting seeding process');

    await sql.begin(async (tx) => {
      console.log('👤 Seeding users...');
      await seedUsers(tx);
      console.log('✅ Users seeded');

      console.log('👥 Seeding customers...');
      await seedCustomers(tx);
      console.log('✅ Customers seeded');

      console.log('🧾 Seeding invoices...');
      await seedInvoices(tx);
      console.log('✅ Invoices seeded');

      console.log('💰 Seeding revenue...');
      await seedRevenue(tx);
      console.log('✅ Revenue seeded');
    });

    console.log('🎯 ALL DONE!');
    return new Response(JSON.stringify({ message: '✅ Database seeded successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Seeding error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
