export interface CompanyData {
  name: string
  website: string
}

export interface Company extends CompanyData {
  id: string
}

export interface ICompanyService {
  createCompany(company: CompanyData): Promise<Company>
  getCompany(id: string): Promise<Company | null>
  getAllCompany(): Promise<Company[]>
  updateCompany(id: string, company: Partial<CompanyData>): Promise<void>
  deleteCompany(id: string): Promise<void>
}