import { getApp, getApps, initializeApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { firebaseConfig } from './firebaseConfig.ts'

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getDatabase(app)
export const authReady = setPersistence(auth, browserLocalPersistence)
