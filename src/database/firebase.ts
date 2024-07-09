import admin from 'firebase-admin';
import FirebaseAdmin from 'firebase-admin';
const firebaseAuth = FirebaseAdmin.auth;
import type { Auth } from 'firebase-admin/auth';
import { type Firestore, getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';


export const firebaseAdmin = getFirebaseAdmin();

function getFirebaseAdmin() {
    let app: admin.app.App | undefined = undefined;
    let auth: Auth | undefined = undefined;
    let firestore: Firestore | undefined = undefined;

    const getFirebaseApp = (): admin.app.App => {
        if (app == undefined) { 
            app = admin.initializeApp({
                credential: (admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN as string) as admin.ServiceAccount)),
            }, 'Server');
        }
    
        return app as admin.app.App;
    };

    const getAuth = (): Auth => {
        if (auth == undefined) {
            auth = firebaseAuth(getFirebaseApp());
        }

        return auth;
    };

    const getFirestore = (): Firestore => {
        if (firestore == undefined) {
            firestore = getFirebaseFirestore(getFirebaseApp());
        }

        return firestore;
    };

    return {
        getApp: getFirebaseApp,
        getAuth: getAuth,
        getFirestore: getFirestore,
    };
}