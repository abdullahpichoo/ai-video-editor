import { initializeDatabase, connectToDatabase, closeDatabaseConnection } from '@/lib/database';

async function setupDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    
    console.log('🔄 Initializing database indexes...');
    await initializeDatabase();
    
    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await closeDatabaseConnection();
  }
}

if (require.main === module) {
  setupDatabase();
}

export { setupDatabase };
