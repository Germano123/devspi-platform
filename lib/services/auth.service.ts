import {
  IAuthService,
  LoginCredentials,
  RegisterCredentials,
  AuthUser,
} from "@/lib/interfaces/auth.interface";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ProfileData } from "@/contexts/auth-context";

export class AuthService implements IAuthService {
  async signIn(data: LoginCredentials): Promise<AuthUser | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) {
        return null;
      }

      const userProfile = userSnap.data() as ProfileData;

      return {
        uid: user.uid,
        email: user.email || "",
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
      };
    } catch (error) {
      console.error("Error signing in:", error);
      return null;
    }
  }

  async signUp(data: RegisterCredentials): Promise<AuthUser | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "profiles", user.uid), {
        firstName: data.firstName,
        lastName: data.lastName,
      });

      return {
        uid: user.uid,
        email: user.email || "",
        firstName: data.firstName,
        lastName: data.lastName,
      };
    } catch (error) {
      console.error("Error signing up:", error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  async verifyEmail(email: string): Promise<void> {
    // implementação do verifyEmail
  }

  async recoverPassword(email: string): Promise<void> {
    // implementação do recoverPassword
  }
}
