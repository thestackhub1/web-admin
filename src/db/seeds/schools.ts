import { client, db, schema } from "./db";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

interface SchoolCSVRow {
  villageCity: string;
  schoolName: string;
  type: string;
  level: string;
  address: string;
  foundedYear: string;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim()); // Push last value
  return values;
}

/**
 * Parse CSV content and extract school data
 * Handles quoted fields, empty values, and various edge cases
 */
function parseCSV(csvContent: string): SchoolCSVRow[] {
  const lines = csvContent.trim().split("\n").filter(line => line.trim().length > 0);
  
  if (lines.length < 2) {
    throw new Error("CSV file must contain at least a header and one data row");
  }
  
  // Parse header
  const headers = parseCSVLine(lines[0]);
  console.log(`   📋 CSV Headers: ${headers.join(", ")}`);
  
  // Find column indices (case-insensitive, flexible matching)
  const villageCityIdx = headers.findIndex((h) => 
    h.toLowerCase().includes("village") || h.toLowerCase().includes("city")
  );
  const schoolNameIdx = headers.findIndex((h) => 
    h.toLowerCase().includes("school") || h.toLowerCase().includes("college")
  );
  const typeIdx = headers.findIndex((h) => h.toLowerCase() === "type");
  const levelIdx = headers.findIndex((h) => h.toLowerCase() === "level");
  const addressIdx = headers.findIndex((h) => 
    h.toLowerCase().includes("address") || h.toLowerCase().includes("full address")
  );
  const foundedYearIdx = headers.findIndex((h) => 
    h.toLowerCase().includes("founded") || h.toLowerCase().includes("year")
  );
  
  // Validate required indices
  if (schoolNameIdx === -1) {
    throw new Error(`Could not find 'School/College Name' column in CSV. Found columns: ${headers.join(", ")}`);
  }

  const rows: SchoolCSVRow[] = [];
  let skippedRows = 0;

  // Process data rows (skip header row)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      skippedRows++;
      continue;
    }

    // Parse CSV line
    const values = parseCSVLine(line);

    // Ensure we have enough values to match headers
    while (values.length < headers.length) {
      values.push("");
    }

    // Extract values with proper trimming
    const villageCity = (villageCityIdx >= 0 ? values[villageCityIdx]?.trim() : "") || "";
    const schoolName = (schoolNameIdx >= 0 ? values[schoolNameIdx]?.trim() : "") || "";
    const type = (typeIdx >= 0 ? values[typeIdx]?.trim() : "") || "";
    const level = (levelIdx >= 0 ? values[levelIdx]?.trim() : "") || "";
    const address = (addressIdx >= 0 ? values[addressIdx]?.trim() : "") || "";
    const foundedYear = (foundedYearIdx >= 0 ? values[foundedYearIdx]?.trim() : "") || "";

    // Skip rows with missing essential data (school name is required)
    if (!schoolName || 
        schoolName.toLowerCase() === "school/college name" ||
        schoolName.toLowerCase().includes("school/college name") ||
        schoolName.startsWith("/") ||
        schoolName.length < 2) {
      skippedRows++;
      continue;
    }

    rows.push({
      villageCity,
      schoolName,
      type,
      level,
      address,
      foundedYear,
    });
  }

  if (skippedRows > 0) {
    console.log(`   ⚠️  Skipped ${skippedRows} invalid or empty rows`);
  }

  return rows;
}

/**
 * Seed Schools from CSV
 * Reads schools.csv and inserts all schools into the database
 * Handles duplicates, validates data, and provides detailed progress reporting
 */
export async function seedSchools() {
  console.log("🏫 Seeding schools from CSV...\n");

  try {
    // Resolve CSV file path - try multiple methods for compatibility
    let csvPath: string;
    const possiblePaths = [
      // CommonJS __dirname
      typeof __dirname !== "undefined" ? path.join(__dirname, "schools.csv") : null,
      // Relative to process.cwd()
      path.join(process.cwd(), "src/db/seeds/schools.csv"),
      // Absolute path from process.cwd()
      path.resolve(process.cwd(), "src/db/seeds/schools.csv"),
      // Relative to seeds directory
      path.resolve(__dirname || ".", "schools.csv"),
    ].filter(Boolean) as string[];

    csvPath = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];

    // Verify file exists
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}\nPlease ensure schools.csv exists in src/db/seeds/`);
    }

    console.log(`   📁 Reading CSV from: ${csvPath}`);
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    
    if (!csvContent || csvContent.trim().length === 0) {
      throw new Error("CSV file is empty");
    }

    // Parse CSV
    const schoolsData = parseCSV(csvContent);
    console.log(`   📊 Parsed ${schoolsData.length} valid schools from CSV\n`);

    if (schoolsData.length === 0) {
      console.warn("   ⚠️  No schools found in CSV file");
      return [];
    }

    // Get existing schools for duplicate checking
    const existingSchools = await db.select({ nameSearch: schema.schools.nameSearch }).from(schema.schools);
    const existingNameSearches = new Set(existingSchools.map(s => s.nameSearch));

    let inserted = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    // Process schools in batches for better performance
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < schoolsData.length; i += batchSize) {
      batches.push(schoolsData.slice(i, i + batchSize));
    }

    console.log(`   🔄 Processing ${schoolsData.length} schools in ${batches.length} batch(es)...\n`);

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const batch = batches[batchIdx];
      const batchStart = batchIdx * batchSize + 1;
      const batchEnd = Math.min((batchIdx + 1) * batchSize, schoolsData.length);

      for (const schoolData of batch) {
        try {
          // Create normalized name for search (lowercase, trimmed)
          const nameSearch = schoolData.schoolName.toLowerCase().trim().replace(/\s+/g, " ");

          // Check if school already exists
          if (existingNameSearches.has(nameSearch)) {
            skipped++;
            continue;
          }

          // Extract state from address or use default
          // All schools in CSV are from Sangamner, Maharashtra
          let locationState = "Maharashtra";
          if (schoolData.address && schoolData.address.includes("Tal.")) {
            locationState = "Maharashtra";
          }

          // Insert school
          await db.insert(schema.schools).values({
            name: schoolData.schoolName,
            nameSearch: nameSearch,
            locationCity: schoolData.villageCity || null,
            locationState: locationState,
            locationCountry: "India",
            address: schoolData.address || null,
            type: schoolData.type || null,
            level: schoolData.level || null,
            foundedYear: schoolData.foundedYear || null,
            isVerified: true, // CSV data is pre-verified
            isUserAdded: false,
            createdBy: null, // System-seeded
          });

          // Add to existing set to avoid duplicates in same batch
          existingNameSearches.add(nameSearch);
          inserted++;

          // Progress indicator
          if (inserted % 50 === 0) {
            console.log(`   ✓ Inserted ${inserted}/${schoolsData.length} schools...`);
          }
        } catch (error: any) {
          errors++;
          const errorMsg = `${schoolData.schoolName}: ${error.message}`;
          if (errors <= 10) {
            errorDetails.push(errorMsg);
            console.error(`   ✗ Error inserting "${schoolData.schoolName}": ${error.message}`);
          } else if (errors === 11) {
            console.error(`   ✗ ... (suppressing further error details)`);
          }
        }
      }

      // Batch completion message
      if (batches.length > 1) {
        console.log(`   ✓ Batch ${batchIdx + 1}/${batches.length} completed (rows ${batchStart}-${batchEnd})`);
      }
    }

    // Final summary
    console.log(`\n✅ Schools seeding completed!`);
    console.log(`   ✓ Inserted: ${inserted} new schools`);
    console.log(`   ⊘ Skipped: ${skipped} duplicates`);
    if (errors > 0) {
      console.log(`   ✗ Errors: ${errors}`);
      if (errorDetails.length > 0) {
        console.log(`\n   Error details (first ${Math.min(errorDetails.length, 5)}):`);
        errorDetails.slice(0, 5).forEach((detail, idx) => {
          console.log(`     ${idx + 1}. ${detail}`);
        });
        if (errorDetails.length > 5) {
          console.log(`     ... and ${errorDetails.length - 5} more`);
        }
      }
    }
    console.log();

    return { inserted, skipped, errors, total: schoolsData.length };
  } catch (error: any) {
    console.error("❌ Error seeding schools:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedSchools()
    .then(() => {
      console.log("✅ Schools seed completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Schools seed failed:", error);
      process.exit(1);
    })
    .finally(() => {
      client.end();
    });
}
