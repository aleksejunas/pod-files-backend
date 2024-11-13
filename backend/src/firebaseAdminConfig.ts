import * as admin from "firebase-admin";
import * as path from "path";

admin.initializeApp({
  credential: admin.credential.cert(
    path.resolve(__dirname, "../serviceAccountKey.json"),
  ),
});

export const verifyToken = async (token: string) => {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    throw new Error("Unauthorized");
  }
};
