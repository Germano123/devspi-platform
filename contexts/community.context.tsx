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
import { CommunityService } from "@/lib/services/community.service";
import { ICommunityService, Community, CreateCommunityInput } from "@/lib/interfaces/community.interface";

interface CommunityContextProps extends ICommunityService {
  communities: Community[];
  loading: boolean;
}

const CommunityContext = createContext<CommunityContextProps | undefined>(undefined);

export const useCommunity = (): CommunityContextProps => {
  const context = useContext(CommunityContext);
  if (!context) throw new Error("useCommunity must be used within a CommunityProvider");
  return context;
};

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);

  const communityService = useMemo(() => new CommunityService(), []);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const all = await communityService.getAllCommunities();
      setCommunities(all);
    } finally {
      setLoading(false);
    }
  }, [communityService]);

  const createCommunity = useCallback(async (data: CreateCommunityInput): Promise<Community | null> => {
    setLoading(true);
    try {
      const community = await communityService.createCommunity(data);
      fetchCommunities();
      return community;
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [communityService]);

  const getCommunity = useCallback(async (id: string): Promise<Community | null> => {
    setLoading(true);
    try {
      return await communityService.getCommunity(id);
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [communityService]);

  const getAllCommunities = useCallback(async (): Promise<Community[]> => {
    setLoading(true);
    try {
      return await communityService.getAllCommunities();
    } finally {
      setLoading(false);
    }
  }, [communityService]);

  const updateCommunity = useCallback(async (id: string, data: Partial<Community>): Promise<Community | null> => {
    setLoading(true);
    try {
      const updated = await communityService.updateCommunity(id, data);
      fetchCommunities();
      return updated;
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [communityService]);

  const deleteCommunity = useCallback(async (id: string): Promise<Community | null> => {
    setLoading(true);
    try {
      const deleted = await communityService.deleteCommunity(id);
      fetchCommunities();
      return deleted;
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [communityService]);

  return (
    <CommunityContext.Provider
      value={{
        communities,
        loading,
        createCommunity,
        getCommunity,
        getAllCommunities,
        updateCommunity,
        deleteCommunity,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

