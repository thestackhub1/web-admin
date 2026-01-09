
import 'dotenv/config';
import { dbService } from "./src/lib/services/dbService";
import { profiles } from "./src/db/schema";
import { eq } from 'drizzle-orm';

async function main() {
    const db = await dbService.getDb();
    // Get first 10 students
    const students = await db.select({
        name: profiles.name,
        classLevel: profiles.classLevel
    })
        .from(profiles)
        .where(eq(profiles.role, 'student'))
        .limit(10);

    console.log("Sample Students:");
    students.forEach(s => {
        console.log(`- ${s.name}: ${s.classLevel}`);
    });
    await dbService.close();
}

main().catch(console.error);
