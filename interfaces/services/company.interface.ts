import { Company } from "@/lib/services/company/company.service"

export interface ICompanyService {
    createCompany: () => Promise<null>
    getCompany: (id: string) => Promise<null>
    getAllCompany: () => Promise<Company[]>
    updateCompany: (id: string, company: any) => Promise<null>
    deleteCompany: (id: string) => Promise<null>
}
