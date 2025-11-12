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
import { ProfileService } from "@/lib/services/profile.service";
import { IProfileService, Profile, CreateProfileInput } from "@/lib/interfaces/profile.interface";

interface ProfileContextProps extends IProfileService {
  userProfile: Profile | null;
  profiles: Profile[];
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextProps | undefined>(undefined);

export const useProfile = (): ProfileContextProps => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within a ProfileProvider");
  return context;
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const profileService = useMemo(() => new ProfileService(), []);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const all = await profileService.getAllProfiles();
      setProfiles(all.result);
    } finally {
      setLoading(false);
    }
  }, [profileService]);

  const createProfile = useCallback(async (data: CreateProfileInput): Promise<Profile | null> => {
    setLoading(true);
    try {
      const profile = await profileService.createProfile(data);
      fetchProfiles();
      return profile;
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [profileService]);

  const getProfile = useCallback(async (id: string): Promise<Profile | null> => {
    setLoading(true);
    try {
      return await profileService.getProfile(id);
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [profileService]);

  const getAllProfiles = useCallback(async (): Promise<{ result: Profile[], last: any | null}> => {
    setLoading(true);
    try {
      return await profileService.getAllProfiles();
    } finally {
      setLoading(false);
    }
  }, [profileService]);

  const updateProfile = useCallback(async (id: string, data: Partial<Profile>): Promise<Profile | null> => {
    setLoading(true);
    try {
      const updated = await profileService.updateProfile(id, data);
      fetchProfiles();
      return updated;
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [profileService]);

  const deleteProfile = useCallback(async (id: string): Promise<Profile | null> => {
    setLoading(true);
    try {
      const deleted = await profileService.deleteProfile(id);
      fetchProfiles();
      return deleted;
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [profileService]);

  const uploadProfilePhoto = async(userId: string, file: File): Promise<string | null> => {
    setLoading(true);
    try {
      const url = await profileService.uploadProfilePhoto(userId, file);
      // TODO: show toast
      return url;
    } catch (error) {
      console.log(error);
      // TODO: show toast
      return null;
    } finally {
      setLoading(false);
    }
  }
  
  const deleteProfilePhoto = async(userId: string, photoURL: string): Promise<void> => {
    setLoading(true);
    try {
      await profileService.deleteProfilePhoto(userId, photoURL);
      // TODO: show toast
    } catch (error) {
      console.log(error);
      // TODO: show toast
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProfileContext.Provider
      value={{
        userProfile,
        profiles,
        loading,
        createProfile,
        getProfile,
        getAllProfiles,
        updateProfile,
        deleteProfile,
        uploadProfilePhoto,
        deleteProfilePhoto,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

