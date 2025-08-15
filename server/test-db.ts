import { db } from "./db";
import { books, members } from "@shared/schema";

export async function testDatabaseConnection() {
  try {
    console.log("🔍 Testing database connection...");
    
    // Test basic connection
    const result = await db.execute("SELECT 1 as test");
    console.log("✅ Database connection successful!");
    
    // Test table access
    const bookCount = await db.select().from(books);
    const memberCount = await db.select().from(members);
    
    console.log(`📚 Found ${bookCount.length} books in database`);
    console.log(`👥 Found ${memberCount.length} members in database`);
    
    if (bookCount.length > 0) {
      console.log("📖 Sample book:", bookCount[0].title);
    }
    
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}