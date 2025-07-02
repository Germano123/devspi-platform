"use client"

import { ICompanyService } from "@/interfaces/services/company.interface"
import { FirebaseCompanyService } from "@/lib/services/company/company.service"
import { createContext, ReactNode, useContext } from "react"

const CompanyContext = createContext<ICompanyService | null>(null)

export const CompanyProvider = ({ children }: { children: ReactNode }) => {

    const service: ICompanyService = new FirebaseCompanyService()

    const createCompany = async (): Promise<null> => {
        return service.createCompany()
    }
    
    const getCompany = async (id: string): Promise<null> => {
        return service.getCompany(id)
    }
    
    const getAllCompany = async (): Promise<null> => {
        return service.getAllCompany()
    }
    
    const updateCompany = async (id: string, company: any): Promise<null> => {
        return service.updateCompany(id, company)
    }
    
    const deleteCompany = async (id: string): Promise<null> => {
        return service.deleteCompany(id)
    }

    return (
        <CompanyContext.Provider
        value={{
            createCompany,
            getCompany,
            getAllCompany,
            updateCompany,
            deleteCompany,
        }}>
            {children}
        </CompanyContext.Provider>
    )
}

export const useCompany = () => {
  const context = useContext(CompanyContext)
  if (!context) {
    throw new Error("useCompanys deve ser usado dentro de um CompanyProvider")
  }
  return context
}
