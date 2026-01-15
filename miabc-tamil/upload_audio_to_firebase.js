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

// Function to upload a folder to Firebase Storage
async function uploadFolder(localFolderPath, storageFolderPath) {
  console.log(`\n📁 Uploading: ${localFolderPath} → ${storageFolderPath}`);
  
  const files = fs.readdirSync(localFolderPath);
  let uploaded = 0;
  
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
            firebaseStorageDownloadTokens: generateToken()
          }
        },
        public: true
      });
      
      uploaded++;
      process.stdout.write(`\r✅ Uploaded: ${uploaded}/${files.length - 1} files`);
    } catch (error) {
      console.error(`\n❌ Failed to upload ${file}:`, error.message);
    }
  }
  
  console.log(`\n✅ Completed: ${storageFolderPath}`);
}

// Generate random token for public URLs
function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Main upload function
async function uploadAllAudio() {
  console.log('🎙️  Starting Firebase Storage Upload...\n');
  console.log('Project: miabc-tamil');
  console.log('Bucket: miabc-tamil.firebasestorage.app\n');
  
  try {
    // Upload Vowels
    await uploadFolder('./Vowels', 'audio/vowels');
    
    // Upload Consonants
    await uploadFolder('./Consonants', 'audio/consonants');
    
    // Upload Words
    await uploadFolder('./Words', 'audio/words');
    
    console.log('\n\n🎉 All audio files uploaded successfully!');
    console.log('\nView files at: https://console.firebase.google.com/project/miabc-tamil/storage');
    
  } catch (error) {
    console.error('\n❌ Upload failed:', error);
  }
}

// Run the upload
uploadAllAudio();
