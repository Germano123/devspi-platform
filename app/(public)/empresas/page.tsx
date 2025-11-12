"use client";

import { useCompany } from "@/contexts/company-context";
import { Company } from "@/lib/services/company.service";
import { useEffect, useState } from "react";

export default function EmpresasPage() {
  const { getAllCompany } = useCompany();
  const [companies, setCompanies] = useState<Company[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      // try - catch - finally
      const result = await getAllCompany();
      setCompanies(result);
      setLoading(false);
    };
    fetchCompanies();
  }, [getAllCompany]);

  if (loading) {
    return <div>Carregando empresas...</div>;
  }

  return (
    <div>
      <ul>
        {companies.map((company) => {
          return <li>{company.name}</li>;
        })}
      </ul>
    </div>
  );
}
