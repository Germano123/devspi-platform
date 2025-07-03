import { ICompanyService } from "@/interfaces/services/company.interface"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

interface CompanyData {
    name: string,
    website: string,
}

export interface Company extends CompanyData{
    id: string,
}

export class FirebaseCompanyService implements ICompanyService {
    async createCompany(): Promise<null> {
        return null
    }

    async getCompany(id: string): Promise<null> {
        return null
    }

    async getAllCompany(): Promise<Company[]> {
        const querySnapshot = await getDocs(collection(db, "companies"))
        const communities: Company[] = []

        querySnapshot.forEach((doc) => {
            communities.push({
                id: doc.id,
                ...(doc.data() as CompanyData),
            })
        })

        // Ordenar por nome
        return communities.sort((a, b) => a.name.localeCompare(b.name))
    }

    async updateCompany(id: string, company: any): Promise<null> {
        return null
    }

    async deleteCompany(id: string): Promise<null> {
        return null
    }
}
