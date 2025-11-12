import { IProfileService, Profile, CreateProfileInput } from "@/lib/interfaces/profile.interface";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

interface GetAllProfilesOptions {
  filterField?: string;
  filterValue?: any;
  orderByField?: string;
  orderDirection?: "asc" | "desc";
  pageSize?: number;
  lastVisible?: any; // doc snapshot do último item da página anterior
}

export class ProfileService implements IProfileService {

  // CRUD functions
  async getProfile(id: string): Promise<Profile | null> {
    const profileRef = doc(db, "profiles", id);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      return null;
    }

    return { uid: profileSnap.id, ...profileSnap.data() } as Profile;
  }

  async getAllProfiles({
    filterField,
    filterValue,
    orderByField,
    orderDirection = "asc",
    pageSize = 10,
    lastVisible,
  }: GetAllProfilesOptions = {}): Promise<{ result: Profile[]; last: any | null }> {
    const profilesRef = collection(db, "profiles");

    const constraints: any[] = [];

    if (filterField && filterValue !== undefined) {
      constraints.push(where(filterField, "==", filterValue));
    }

    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection));
    }

    if (pageSize) {
      constraints.push(limit(pageSize));
    }

    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }

    const q = query(profilesRef, ...constraints);
    const snapshot = await getDocs(q);

    const profiles: Profile[] = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as Profile[];

    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    return { result: profiles, last: lastDoc };
  }

  async createProfile(data: CreateProfileInput): Promise<Profile | null> {
    const profilesRef = collection(db, "profiles");

    const docRef = await addDoc(profilesRef, data);
    const newDoc = await getDoc(doc(db, "profiles", docRef.id));

    if (!newDoc.exists()) return null;

    return { uid: newDoc.id, ...newDoc.data() } as Profile;
  }

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile | null> {
    const profileRef = doc(db, "profiles", id);
    const snapshot = await getDoc(profileRef);

    if (!snapshot.exists()) return null;

    await updateDoc(profileRef, data);

    const updatedSnap = await getDoc(profileRef);
    if (!updatedSnap.exists()) return null;

    return { uid: updatedSnap.id, ...updatedSnap.data() } as Profile;
  }

  async deleteProfile(id: string): Promise<Profile | null> {
    const profileRef = doc(db, "profiles", id);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return null;
    }

    const profile = { uid: profileSnap.id, ...profileSnap.data() } as Profile;

    await deleteDoc(profileRef);

    return profile;
  }

  // Função para upload de foto de perfil
  async uploadProfilePhoto(
    userId: string,
    file: File
  ): Promise<string | null> {
    try {
      const fileExtension = file.name.includes(".")
      ? file.name.split(".").pop()
      : "jpg";
      const fileName = `profile_photos/${userId}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      // Atualizar o perfil do usuário com a URL da foto
      await this.updateProfile(userId, { photoURL } as Profile);

      return photoURL;
    } catch (error) {
      console.log("Upload service > error upload file image: ", error);
      return null;
    }
  };

  // Função para excluir foto de perfil
  async deleteProfilePhoto(
    userId: string,
    photoURL: string
  ): Promise<void> {
    try {
      // Extrair o caminho do arquivo da URL
      const fileRef = ref(storage, photoURL);
      await deleteObject(fileRef);

      // Atualizar o perfil do usuário removendo a URL da foto
      await this.updateProfile(userId, {
        photoURL: null,
      } as unknown as Profile);
    } catch (error) {
      console.error("Erro ao excluir foto:", error);
      // Se não conseguir excluir o arquivo, pelo menos remove a referência no perfil
      await this.updateProfile(userId, {
        photoURL: null,
      } as unknown as Profile);
    }
  }
}
