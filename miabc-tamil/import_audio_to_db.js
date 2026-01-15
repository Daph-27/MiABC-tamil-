const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = './miabc.db';

// Open database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to miabc.db\n');
});

// Create audio_files table if it doesn't exist
function createAudioTable() {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS audio_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        filename TEXT NOT NULL,
        display_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        audio_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(category, filename)
      )
    `;
    
    db.run(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('✅ audio_files table ready\n');
        resolve();
      }
    });
  });
}

// Insert audio file record
function insertAudio(category, filename, displayName, filePath) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT OR REPLACE INTO audio_files (category, filename, display_name, file_path)
      VALUES (?, ?, ?, ?)
    `;
    
    db.run(sql, [category, filename, displayName, filePath], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

// Process folder and import files
async function processFolder(folderName, category) {
  const folderPath = `./${folderName}`;
  
  if (!fs.existsSync(folderPath)) {
    console.log(`⚠️  Folder not found: ${folderPath}`);
    return 0;
  }
  
  console.log(`📁 Processing: ${folderName} → ${category}`);
  
  const files = fs.readdirSync(folderPath);
  let imported = 0;
  
  for (const file of files) {
    if (!file.endsWith('.wav')) continue;
    
    const filePath = path.join(folderPath, file);
    const displayName = file.replace(/\.(wav|WAV)$/, '').replace(/^(Vowels|Consonants|Words) - /, '');
    
    try {
      await insertAudio(category, file, displayName, filePath);
      imported++;
      if (imported % 20 === 0) {
        console.log(`   ✓ Imported ${imported} files...`);
      }
    } catch (err) {
      console.log(`   ✗ Failed: ${file} - ${err.message}`);
    }
  }
  
  console.log(`✅ ${category}: ${imported} files imported\n`);
  return imported;
}

// Query and display results
function displayResults() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT category, COUNT(*) as count 
      FROM audio_files 
      GROUP BY category
      ORDER BY category
    `;
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        console.log('📊 Import Summary:');
        console.log('═════════════════════════════');
        let total = 0;
        rows.forEach(row => {
          console.log(`${row.category.padEnd(20)} ${row.count} files`);
          total += row.count;
        });
        console.log('═════════════════════════════');
        console.log(`Total:               ${total} files\n`);
        resolve();
      }
    });
  });
}

// Main execution
async function main() {
  console.log('🎙️  Importing Audio Files to SQLite Database\n');
  
  try {
    // Create table
    await createAudioTable();
    
    // Import folders
    await processFolder('Vowels', 'vowels');
    await processFolder('Consonants', 'consonants');
    await processFolder('Words', 'words');
    
    // Display results
    await displayResults();
    
    console.log('✨ Import complete!');
    console.log('\nTo query the audio files:');
    console.log('SELECT * FROM audio_files WHERE category = "vowels";');
    console.log('SELECT * FROM audio_files WHERE display_name = "A";');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      }
    });
  }
}

main();
