const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// INSTRUCTIONS:
// 1. Download your service account key from Firebase Console -> Project Settings -> Service Accounts
// 2. Save it as 'serviceAccountKey.json' in this directory.
// 3. Run: node seed_firestore.js

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error("ERROR: 'serviceAccountKey.json' not found. Please add your Firebase Admin SDK key.");
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const modulesDir = path.join(__dirname, 'modules');
const quizzesDir = path.join(__dirname, 'quizzes');

async function seed() {
    console.log("🚀 Starting Firestore Seeding...");

    // 1. Seed Modules
    const moduleFiles = fs.readdirSync(modulesDir);
    for (const file of moduleFiles) {
        if (!file.endsWith('.json')) continue;
        const data = JSON.parse(fs.readFileSync(path.join(modulesDir, file)));
        const docId = `module_${data.id}`;

        await db.collection('content').doc(docId).set(data);
        console.log(`✅ Uploaded Module: ${data.title} (${docId})`);
    }

    // 2. Seed Quizzes
    const quizFiles = fs.readdirSync(quizzesDir);
    for (const file of quizFiles) {
        if (!file.endsWith('.json')) continue;
        const data = JSON.parse(fs.readFileSync(path.join(quizzesDir, file)));
        const docId = `quiz_${data.moduleId}`; // Ensure consistent naming

        await db.collection('content').doc(docId).set(data);
        console.log(`✅ Uploaded Quiz: ${data.title} (${docId})`);
    }

    console.log("🎉 Seeding Complete!");
}

seed().catch(console.error);
