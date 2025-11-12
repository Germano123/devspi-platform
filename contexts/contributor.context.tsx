"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { ContributorService } from "@/lib/services/contributor.service";
import { IContributorService, Contributor, CreateContributorInput } from "@/lib/interfaces/contributor.interface";

interface ContributorContextProps extends IContributorService {
  contributors: Contributor[];
  loading: boolean;
}

const ContributorContext = createContext<ContributorContextProps | undefined>(undefined);

export const useContributor = (): ContributorContextProps => {
  const context = useContext(ContributorContext);
  if (!context) throw new Error("useContributor must be used within a ContributorProvider");
  return context;
};

export function ContributorProvider({ children }: { children: ReactNode }) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(false);

  const contributorService = useMemo(() => new ContributorService(), []);

  useEffect(() => {
    fetchContributors();
  }, []);

  const fetchContributors = useCallback(async () => {
    setLoading(true);
    try {
      const all = await contributorService.getAllContributors();
      setContributors(all);
    } finally {
      setLoading(false);
    }
  }, [contributorService]);

  const createContributor = useCallback(async (data: CreateContributorInput): Promise<Contributor | null> => {
    setLoading(true);
    try {
      const contributor = await contributorService.createContributor(data);
      fetchContributors();
      return contributor;
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contributorService]);

  const getContributor = useCallback(async (id: string): Promise<Contributor | null> => {
    setLoading(true);
    try {
      return await contributorService.getContributor(id);
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contributorService]);

  const getAllContributors = useCallback(async (): Promise<Contributor[]> => {
    setLoading(true);
    try {
      return await contributorService.getAllContributors();
    } finally {
      setLoading(false);
    }
  }, [contributorService]);

  const updateContributor = useCallback(async (id: string, data: Partial<Contributor>): Promise<Contributor | null> => {
    setLoading(true);
    try {
      const updated = await contributorService.updateContributor(id, data);
      fetchContributors();
      return updated;
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contributorService]);

  const deleteContributor = useCallback(async (id: string): Promise<Contributor | null> => {
    setLoading(true);
    try {
      const deleted = await contributorService.deleteContributor(id);
      fetchContributors();
      return deleted;
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contributorService]);

  return (
    <ContributorContext.Provider
      value={{
        contributors,
        loading,
        createContributor,
        getContributor,
        getAllContributors,
        updateContributor,
        deleteContributor,
      }}
    >
      {children}
    </ContributorContext.Provider>
  );
}

