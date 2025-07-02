export interface ICompanyService {
    createCompany: () => Promise<null>
    getCompany: (id: string) => Promise<null>
    getAllCompany: () => Promise<null>
    updateCompany: (id: string, company: any) => Promise<null>
    deleteCompany: (id: string) => Promise<null>
}
