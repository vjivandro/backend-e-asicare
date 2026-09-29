const admin = require("firebase-admin");

const serviceAccount = require("./e-asi-care-firebase-adminsdk-fbsvc-301d8352fa.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Pemakaian: node backup/create-superadmin.cjs <email> <password> [username]
async function createSuperadmin() {
    const [email, password, username = "Super Admin"] = process.argv.slice(2);

    if (!email || !password) {
        console.error("Pemakaian: node backup/create-superadmin.cjs <email> <password> [username]");
        process.exit(1);
    }

    try {
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
            console.log(`ℹ️ Akun Auth sudah ada (${userRecord.uid}), password diperbarui`);
            await admin.auth().updateUser(userRecord.uid, { password, displayName: username });
        } catch (error) {
            if (error.code !== "auth/user-not-found") throw error;
            userRecord = await admin.auth().createUser({ email, password, displayName: username });
            console.log(`✅ Akun Auth dibuat (${userRecord.uid})`);
        }

        await db.collection("admins").doc(userRecord.uid).set({
            email,
            role: "superadmin",
            username,
        });

        console.log(`✅ Superadmin ${email} tersimpan di admins/${userRecord.uid}`);
    } catch (error) {
        console.error("❌ Error membuat superadmin:", error);
        process.exit(1);
    }
}

createSuperadmin();
