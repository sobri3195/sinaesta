#!/usr/bin/env node
/**
 * Database Setup Script
 *
 * This script initializes the Sinaesta database by:
 * 1. Creating the database if it doesn't exist
 * 2. Running migration SQL files
 * 3. Running seed data
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration from .env
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres', // Connect to default database first
};

async function setupDatabase() {
  console.log('🔧 Sinaesta Database Setup\n');

  const pool = new Pool(config);

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'sinaesta';
    console.log(`🗄️  Checking/creating database: ${dbName}...`);

    try {
      await pool.query(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`);
    } catch (err) {
      // Ignore if database doesn't exist
    }

    await pool.query(`CREATE DATABASE ${dbName}`);
    console.log('✅ Database created\n');

    // Close connection to postgres database
    await pool.end();

    // Connect to sinaesta database
    const sinaestaConfig = { ...config, database: dbName };
    const sinaestaPool = new Pool(sinaestaConfig);

    console.log('📡 Connecting to sinaesta database...');
    await sinaestaPool.query('SELECT NOW()');
    console.log('✅ Connected to sinaesta database\n');

    // Run migrations
    const migrations = [
      '001_initial_schema.sql',
      '002_auth_extensions.sql',
      '002_realtime_features.sql',
      '003_email_system.sql',
      '003_file_metadata.sql',
    ];

    const migrationsDir = join(__dirname, '../server/migrations');

    for (const migrationFile of migrations) {
      const migrationPath = join(migrationsDir, migrationFile);
      console.log(`📄 Running migration: ${migrationFile}...`);

      try {
        const sql = readFileSync(migrationPath, 'utf-8');
        await sinaestaPool.query(sql);
        console.log(`✅ Migration ${migrationFile} completed\n`);
      } catch (err) {
        console.error(`❌ Error running ${migrationFile}:`, err.message);
        throw err;
      }
    }

    // Run seed data
    console.log('🌱 Running seed data...');
    const seedPath = join(migrationsDir, 'seed.sql');
    const seedSql = readFileSync(seedPath, 'utf-8');
    await sinaestaPool.query(seedSql);
    console.log('✅ Seed data completed\n');

    // Verify tables
    console.log('🔍 Verifying database setup...');
    const tables = await sinaestaPool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📊 Tables created:');
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Verify demo accounts
    const demoAccounts = await sinaestaPool.query(`
      SELECT email, role, status
      FROM users
      WHERE email LIKE '%@sinaesta.com'
      ORDER BY email;
    `);

    console.log('\n👥 Demo accounts created:');
    demoAccounts.rows.forEach(row => {
      console.log(`   ✓ ${row.email} (${row.role})`);
    });

    await sinaestaPool.end();

    console.log('\n✨ Database setup completed successfully!');
    console.log('\n🚀 You can now start the backend server:');
    console.log('   npm run server');
    console.log('\n📝 Or start both frontend and backend:');
    console.log('   npm run dev:all');

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check your .env file configuration');
    console.error('3. Verify database credentials');
    process.exit(1);
  }
}

setupDatabase();
