export interface Profile {
  uid: string;
  
  firstName: string;
  lastName: string;

  isAdmin: boolean;
  
  areaAtuacao: string[];
  tempoExperiencia: string;
  nivelEnsino: string;

  photoURL?: string;
  
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;

  cookiePreferences?: {
    essential: boolean;
    performance: boolean;
    analytics: boolean;
    advertising: boolean;
  };
  privacySettings?: {
    emailMarketing: boolean;
    newsletter: boolean;
  };

  // timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}

export interface CreateProfileInput extends Omit<Profile, "uid" | "createdAt" | "updatedAt" | "lastLogin"> {}

export interface IProfileService {
  getProfile(id: string): Promise<Profile | null>;
  getAllProfiles(): Promise<{ result: Profile[], last: any | null }>;
  createProfile(data: CreateProfileInput): Promise<Profile | null>;
  updateProfile(id: string, data: Partial<Profile>): Promise<Profile | null>;
  deleteProfile(id: string): Promise<Profile | null>;
  
  uploadProfilePhoto: (userId: string, file: File) => Promise<string | null>;
  deleteProfilePhoto: (userId: string, photoURL: string) => Promise<void>;
}
