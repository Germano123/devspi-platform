import { ICompanyService } from "@/lib/interfaces/company.interface";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

interface CompanyData {
  name: string;
  website: string;
}

export interface Company extends CompanyData {
  id: string;
}

export class FirebaseCompanyService implements ICompanyService {
  private collectionRef = collection(db, "companies");

  async createCompany(company: CompanyData): Promise<Company> {
    const docRef = await addDoc(this.collectionRef, company);
    return {
      id: docRef.id,
      ...company,
    };
  }

  async getCompany(id: string): Promise<Company | null> {
    const docRef = doc(db, "companies", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...(docSnap.data() as CompanyData),
    };
  }

  async getAllCompany(): Promise<Company[]> {
    const querySnapshot = await getDocs(this.collectionRef);
    const companies: Company[] = [];

    querySnapshot.forEach((doc) => {
      companies.push({
        id: doc.id,
        ...(doc.data() as CompanyData),
      });
    });

    return companies.sort((a, b) => a.name.localeCompare(b.name));
  }

  async updateCompany(
    id: string,
    company: Partial<CompanyData>
  ): Promise<void> {
    const docRef = doc(db, "companies", id);
    await updateDoc(docRef, company);
  }

  async deleteCompany(id: string): Promise<void> {
    const docRef = doc(db, "companies", id);
    await deleteDoc(docRef);
  }
}
