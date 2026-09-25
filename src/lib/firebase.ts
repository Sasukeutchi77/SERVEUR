import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("[Firebase] Client hors-ligne ou base en initialisation.");
    }
  }
}
testFirestoreConnection();

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return credential.user;
}

export async function registerWithEmail(email: string, pass: string, displayName?: string): Promise<FirebaseUser> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const user = credential.user;
  const safeName = displayName?.trim() || user.email?.split("@")[0] || "Client ORAX";

  if (displayName?.trim()) await updateProfile(user, { displayName: safeName });

  // The browser may create only a zero-balance profile. Any credit must be
  // granted by a trusted backend/payment webhook, never by client JavaScript.
  try {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: safeName,
      walletBalanceCfa: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: false });
  } catch (err) {
    console.error("[Firebase] Impossible de créer le profil utilisateur :", err);
  }
  return user;
}

export async function resetUserPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid: string) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error("[Firebase] Erreur lecture profil :", e);
    return null;
  }
}

/**
 * Wallet balances are server-owned. Keeping this function as a hard failure
 * prevents old UI code from silently pretending that a recharge succeeded.
 */
export async function updateUserWalletBalance(_uid: string, _newBalanceCfa: number): Promise<never> {
  throw new Error("Le solde portefeuille doit être modifié par le backend de paiement.");
}
