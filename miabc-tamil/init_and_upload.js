const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account key
const serviceAccount = require('./backend/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'miabc-tamil.appspot.com'
});

const bucket = admin.storage().bucket();

// First, create a test file to initialize the bucket
async function initializeBucket() {
  try {
    console.log('🔧 Initializing Firebase Storage bucket...');
    const testFile = bucket.file('.initialized');
    await testFile.save('Bucket initialized');
    console.log('✅ Bucket initialized successfully\n');
  } catch (error) {
    console.error('❌ Bucket initialization failed:', error.message);
    throw error;
  }
}

// Function to upload a folder to Firebase Storage
async function uploadFolder(localFolderPath, storageFolderPath) {
  console.log(`\n📁 Uploading: ${localFolderPath} → ${storageFolderPath}`);
  
  if (!fs.existsSync(localFolderPath)) {
    console.log(`⚠️  Folder not found: ${localFolderPath}`);
    return;
  }
  
  const files = fs.readdirSync(localFolderPath);
  let uploaded = 0;
  let failed = 0;
  
  for (const file of files) {
    // Skip .DS_Store and other hidden files
    if (file.startsWith('.')) continue;
    
    const localFilePath = path.join(localFolderPath, file);
    const storageFilePath = `${storageFolderPath}/${file}`;
    
    try {
      await bucket.upload(localFilePath, {
        destination: storageFilePath,
        metadata: {
          contentType: 'audio/wav',
          metadata: {
            firebaseStorageDownloadTokens: Date.now().toString()
          }
        },
        public: true
      });
      
      uploaded++;
      if (uploaded % 10 === 0) {
        console.log(`   ✓ Uploaded ${uploaded} files...`);
      }
    } catch (error) {
      failed++;
      console.log(`   ✗ Failed: ${file} - ${error.message}`);
    }
  }
  
  console.log(`✅ Completed: ${storageFolderPath} (${uploaded} uploaded, ${failed} failed)`);
}

// Main execution
async function main() {
  console.log('🎙️  Starting Firebase Storage Upload...\n');
  console.log(`Project: ${serviceAccount.project_id}`);
  console.log(`Bucket: miabc-tamil.appspot.com\n`);
  
  try {
    // Initialize bucket first
    await initializeBucket();
    
    // Upload folders
    await uploadFolder('./Vowels', 'audio/vowels');
    await uploadFolder('./Consonants', 'audio/consonants');
    await uploadFolder('./Words', 'audio/words');
    
    console.log('\n✨ Upload complete!');
    console.log('\nFiles are available at:');
    console.log('https://storage.googleapis.com/miabc-tamil.appspot.com/audio/vowels/');
    console.log('https://storage.googleapis.com/miabc-tamil.appspot.com/audio/consonants/');
    console.log('https://storage.googleapis.com/miabc-tamil.appspot.com/audio/words/');
    
  } catch (error) {
    console.error('\n❌ Upload failed:', error);
    process.exit(1);
  }
}

main();
