const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = require("./e-asi-care-firebase-adminsdk-fbsvc-301d8352fa.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function backupFirestore() {
    try {
        const collections = await db.listCollections();

        const backupData = {};

        for (const collection of collections) {
            console.log(`📦 Backup collection: ${collection.id}`);

            const snapshot = await collection.get();

            backupData[collection.id] = {};

            snapshot.forEach((doc) => {
                backupData[collection.id][doc.id] = doc.data();
            });
        }

        fs.writeFileSync(
            "backup.json",
            JSON.stringify(backupData, null, 2)
        );

        console.log("✅ Backup selesai!");
    } catch (error) {
        console.error("❌ Error backup:", error);
    }
}

backupFirestore();