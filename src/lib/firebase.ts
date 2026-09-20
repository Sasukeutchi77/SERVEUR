import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  getDocFromServer 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialisation de l'application Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Authentification Firebase
export const auth = getAuth(app);

// Base de données Firestore
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Validation de connexion Firestore initiale
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("[Firebase] Attention: Le client est hors-ligne ou la base est en cours d'initialisation.");
    }
  }
}
testFirestoreConnection();

/**
 * Connexion avec Email et Mot de passe
 */
export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return credential.user;
}

/**
 * Inscription avec Email et Mot de passe
 */
export async function registerWithEmail(
  email: string, 
  pass: string, 
  displayName?: string
): Promise<FirebaseUser> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const user = credential.user;
  
  if (displayName && displayName.trim()) {
    await updateProfile(user, { displayName: displayName.trim() });
  }

  // Initialisation du document profil utilisateur dans Firestore
  try {
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: displayName?.trim() || user.email?.split("@")[0] || "Client ORAX",
      walletBalanceCfa: 3500, // Bonus de bienvenue offert
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error("[Firebase] Erreur lors de la création du document utilisateur :", err);
  }

  return user;
}

/**
 * Réinitialisation du mot de passe par email
 */
export async function resetUserPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Déconnexion de l'utilisateur
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Écouteur d'état d'authentification
 */
export function subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Récupère ou met à jour le profil Firestore de l'utilisateur
 */
export async function getUserProfile(uid: string) {
  try {
    const userDocRef = doc(db, "users", uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (e) {
    console.error("[Firebase] Erreur lecture profil :", e);
    return null;
  }
}

/**
 * Met à jour le solde CFA de l'utilisateur dans Firestore
 */
export async function updateUserWalletBalance(uid: string, newBalanceCfa: number) {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
      walletBalanceCfa: newBalanceCfa,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.error("[Firebase] Erreur mise à jour solde :", e);
  }
}
