"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type User, onAuthStateChanged, UserCredential } from "firebase/auth";
import { auth, db, storage } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  addDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  IAuthService,
  LoginCredentials,
  RegisterCredentials,
} from "@/lib/interfaces/auth.interface";
import { AuthService } from "@/lib/services/auth.service";

interface AuthContextType extends IAuthService {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;

  // Funções para usuários
  createUserProfile: (userId: string, data: ProfileData) => Promise<void>;
  getUserProfile: (userId: string) => Promise<ProfileData | null>;
  updateUserProfile: (userId: string, data: ProfileData) => Promise<void>;
  uploadProfilePhoto: (userId: string, file: File) => Promise<string>;
  deleteProfilePhoto: (userId: string, photoURL: string) => Promise<void>;
  getAllProfiles: () => Promise<(ProfileData & { id: string })[]>;

  // Funções para comunidades
  getAllCommunities: () => Promise<Community[]>;
  getAdminCommunities: (userId: string) => Promise<Community[]>;
  getCommunity: (id: string) => Promise<Community | null>;
  createCommunity: (data: CommunityData) => Promise<string>;
  updateCommunity: (id: string, data: CommunityData) => Promise<void>;
  deleteCommunity: (id: string) => Promise<void>;

  // Funções para gerenciamento de comunidades
  joinCommunity: (
    userId: string,
    communityId: string,
    role?: string
  ) => Promise<void>;
  leaveCommunity: (userId: string, communityId: string) => Promise<void>;
  getCommunityMembers: (communityId: string) => Promise<CommunityMember[]>;
  updateMemberRole: (
    communityId: string,
    userId: string,
    role: string
  ) => Promise<void>;
  getUserCommunities: (userId: string) => Promise<UserCommunity[]>;
  isCommunityAdmin: (userId: string, communityId: string) => Promise<boolean>;
  isCommunityMember: (userId: string, communityId: string) => Promise<boolean>;

  // Funções para eventos
  getAllEvents: () => Promise<Event[]>;
  getEvent: (id: string) => Promise<Event | null>;
  createEvent: (data: EventData) => Promise<string>;
  updateEvent: (id: string, data: EventData) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  showInterestInEvent: (userId: string, eventId: string) => Promise<void>;
  confirmAttendanceToEvent: (userId: string, eventId: string) => Promise<void>;
  removeInterestFromEvent: (userId: string, eventId: string) => Promise<void>;
  removeAttendanceFromEvent: (userId: string, eventId: string) => Promise<void>;
  getEventInterested: (eventId: string) => Promise<EventParticipant[]>;
  getEventAttendees: (eventId: string) => Promise<EventParticipant[]>;
  getUserEvents: (userId: string) => Promise<UserEvent[]>;

  // Funções para contribuidores
  getContributor: (id: string) => Promise<Contributor | null>;
  getAllContributors: () => Promise<Contributor[]>;
  createContributor: (data: ContributorData) => Promise<string>;

  // Funções para projetos
  getAllProjects: () => Promise<Project[]>;
  getProject: (id: string) => Promise<Project | null>;
  createProject: (data: ProjectData) => Promise<string>;
  updateProject: (id: string, data: Partial<ProjectData>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getUserProjects: (userId: string) => Promise<Project[]>;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  role: string;
  linkedinUrl: string;
  areaAtuacao: string[];
  tempoExperiencia: string;
  nivelEnsino: string;
  photoURL?: string;
  githubUrl?: string;
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
}

export interface CommunityData {
  name: string;
  bio: string;
  whatsappLink: string;
  websiteLink: string;
  logoUrl?: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: number;
}

export interface Community extends CommunityData {
  id: string;
  members?: CommunityMember[];
}

export interface CommunityMember {
  userId: string;
  role: string; // 'admin', 'editor', 'member'
  joinedAt: number;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
}

export interface UserCommunity {
  communityId: string;
  role: string;
  joinedAt: number;
  name?: string;
  logoUrl?: string;
}

// Tipos para eventos
export interface EventData {
  title: string;
  description: string;
  date: number; // timestamp
  endDate?: number; // timestamp opcional para eventos com duração
  location: string;
  imageUrl?: string;
  communityId: string;
  createdBy: string;
  createdAt: number;
  attractionType: string; // 'palestra', 'workshop', 'roda_de_conversa', etc.
  isOnline: boolean;
  meetingUrl?: string; // URL para eventos online
  maxAttendees?: number; // Número máximo de participantes (opcional)
}

export interface Event extends EventData {
  id: string;
  interestedCount: number;
  attendeesCount: number;
}

export interface EventParticipant {
  userId: string;
  joinedAt: number;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
}

export interface UserEvent {
  eventId: string;
  status: "interested" | "attending";
  joinedAt: number;
  title?: string;
  date?: number;
}

// Tipos para contribuidores
export interface ContributorData {
  roles: string[];
  joinedAt: number;
  createdAt: number;
  updatedAt?: number;
  userId: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface Contributor extends ContributorData {
  id: string;
}

// Tipos para projetos
export interface ProjectData {
  title: string;
  description: string;
  authorId: string;
  authorName?: string;
  coauthors?: string[];
  imageUrl?: string;
  externalLink?: string;
  category: "portfolio" | "commercial" | "scientific";
  createdAt: number;
  updatedAt?: number;
}

export interface Project extends ProjectData {
  id: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setAdmin] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          setUser(user);
          // Verificar se o usuário é admin
          // setAdmin(user ? ADMIN_EMAILS.includes(user.email || "") : false)
          if (user) {
            const profile = await getContributor(user.uid);
            setAdmin(profile ? true : false);
          } else {
            setAdmin(false);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Auth state change error:", error);
          setUser(null);
          setAdmin(false);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Failed to set up auth state listener:", error);
      setUser(null);
      setAdmin(false);
      setLoading(false);
    }

    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error("Error unsubscribing from auth state:", error);
      }
    };
  }, []);

  const authService: IAuthService = new AuthService();

  const signUp = async (data: RegisterCredentials) => {
    setLoading(true);
    try {
      // TODO: show toast
      return await authService.signUp(data);
    } catch (error) {
      console.log("Error signing up: ", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data: LoginCredentials) => {
    setLoading(true);
    try {
      // TODO: show toast
      const loggedUser = await authService.signIn(data);
      localStorage.setItem("devspi-user", JSON.stringify(loggedUser));
      return loggedUser;
    } catch (error) {
      console.log("Error signing in: ", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("devspi-user");
      await authService.logout();
      // TODO: show toast
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const verifyEmail = async (email: string) => {
    // TODO: try catch
    await authService.verifyEmail(email);
  };

  const recoverPassword = async (email: string) => {
    // TODO: try catch
    await authService.recoverPassword(email);
  };

  const createUserProfile = async (userId: string, data: ProfileData) => {
    await setDoc(doc(db, "profiles", userId), data);
  };

  const getUserProfile = async (
    userId: string
  ): Promise<ProfileData | null> => {
    const docRef = doc(db, "profiles", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Omit<ProfileData, "areaAtuacao"> & {
        areaAtuacao: string | string[];
      };

      // Garantir que areaAtuacao seja sempre um array
      if (typeof data.areaAtuacao === "string") {
        return {
          ...data,
          areaAtuacao: [data.areaAtuacao],
        } as ProfileData;
      }

      return data as ProfileData;
    } else {
      return null;
    }
  };

  const updateUserProfile = async (userId: string, data: ProfileData) => {
    await setDoc(doc(db, "profiles", userId), data, { merge: true });
  };

  // Função para upload de foto de perfil
  const uploadProfilePhoto = async (
    userId: string,
    file: File
  ): Promise<string> => {
    const fileExtension = file.name.split(".").pop();
    const fileName = `profile_photos/${userId}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(storageRef);

    // Atualizar o perfil do usuário com a URL da foto
    await updateUserProfile(userId, { photoURL } as ProfileData);

    return photoURL;
  };

  // Função para excluir foto de perfil
  const deleteProfilePhoto = async (
    userId: string,
    photoURL: string
  ): Promise<void> => {
    try {
      // Extrair o caminho do arquivo da URL
      const fileRef = ref(storage, photoURL);
      await deleteObject(fileRef);

      // Atualizar o perfil do usuário removendo a URL da foto
      await updateUserProfile(userId, {
        photoURL: null,
      } as unknown as ProfileData);
    } catch (error) {
      console.error("Erro ao excluir foto:", error);
      // Se não conseguir excluir o arquivo, pelo menos remove a referência no perfil
      await updateUserProfile(userId, {
        photoURL: null,
      } as unknown as ProfileData);
    }
  };

  const getAllProfiles = async (): Promise<
    (ProfileData & { id: string })[]
  > => {
    const querySnapshot = await getDocs(collection(db, "profiles"));
    const profiles: (ProfileData & { id: string })[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<ProfileData, "areaAtuacao"> & {
        areaAtuacao: string | string[];
      };

      // Garantir que areaAtuacao seja sempre um array
      let areaAtuacao: string[];
      if (typeof data.areaAtuacao === "string") {
        areaAtuacao = [data.areaAtuacao];
      } else {
        areaAtuacao = data.areaAtuacao || [];
      }

      profiles.push({
        id: doc.id,
        ...data,
        areaAtuacao,
      } as ProfileData & { id: string });
    });

    return profiles;
  };

  // Funções para gerenciar comunidades
  const getAllCommunities = async (): Promise<Community[]> => {
    const querySnapshot = await getDocs(collection(db, "communities"));
    const communities: Community[] = [];

    querySnapshot.forEach((doc) => {
      communities.push({
        id: doc.id,
        ...(doc.data() as CommunityData),
      });
    });

    // Ordenar por nome
    return communities.sort((a, b) => a.name.localeCompare(b.name));
  };

  const getCommunity = async (id: string): Promise<Community | null> => {
    const docRef = doc(db, "communities", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...(docSnap.data() as CommunityData),
      };
    } else {
      return null;
    }
  };

  // get communities that `userId` is 'admin'
  const getAdminCommunities = async (userId: string): Promise<Community[]> => {
    const snapshot = await getDocs(collection(db, "communities"));
    const communities: Community[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as Community;
      console.log(data.members);
      const isAdmin = data.members?.some(
        (member) => member.userId === userId && member.role === "admin"
      );
      if (isAdmin) {
        communities.push({
          ...data,
          id: doc.id,
        });
      }
    });

    return communities;
  };

  const createCommunity = async (data: CommunityData): Promise<string> => {
    const docRef = doc(collection(db, "communities"));
    await setDoc(docRef, {
      ...data,
      createdAt: Date.now(),
    });

    // Adicionar o criador como admin da comunidade
    if (data.createdBy) {
      await joinCommunity(data.createdBy, docRef.id, "admin");
    }

    return docRef.id;
  };

  const updateCommunity = async (
    id: string,
    data: CommunityData
  ): Promise<void> => {
    await setDoc(doc(db, "communities", id), data, { merge: true });
  };

  const deleteCommunity = async (id: string): Promise<void> => {
    // Primeiro, excluir todos os membros da comunidade
    const membersSnapshot = await getDocs(
      collection(db, "communities", id, "members")
    );
    const deletePromises = membersSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);

    // Depois, excluir a comunidade
    await deleteDoc(doc(db, "communities", id));
  };

  // Funções para gerenciamento de membros da comunidade
  const joinCommunity = async (
    userId: string,
    communityId: string,
    role = "member"
  ): Promise<void> => {
    const memberRef = doc(db, "communities", communityId, "members", userId);

    // Verificar se a comunidade é privada
    const community = await getCommunity(communityId);
    if (community?.isPrivate && role === "member") {
      // Se for privada, o status inicial é 'pending'
      await setDoc(memberRef, {
        userId,
        role: "pending",
        joinedAt: Date.now(),
      });
    } else {
      // Se não for privada ou se o papel for diferente de 'member', adicionar diretamente
      await setDoc(memberRef, {
        userId,
        role,
        joinedAt: Date.now(),
      });
    }
  };

  const leaveCommunity = async (
    userId: string,
    communityId: string
  ): Promise<void> => {
    await deleteDoc(doc(db, "communities", communityId, "members", userId));
  };

  const getCommunityMembers = async (
    communityId: string
  ): Promise<CommunityMember[]> => {
    const membersSnapshot = await getDocs(
      collection(db, "communities", communityId, "members")
    );
    const members: CommunityMember[] = [];

    for (const memberDoc of membersSnapshot.docs) {
      const memberData = memberDoc.data() as Omit<
        CommunityMember,
        "firstName" | "lastName" | "photoURL"
      >;

      // Buscar informações do perfil do usuário
      const userProfile = await getUserProfile(memberData.userId);

      members.push({
        ...memberData,
        firstName: userProfile?.firstName,
        lastName: userProfile?.lastName,
        photoURL: userProfile?.photoURL,
      });
    }

    return members;
  };

  const updateMemberRole = async (
    communityId: string,
    userId: string,
    role: string
  ): Promise<void> => {
    const memberRef = doc(db, "communities", communityId, "members", userId);
    await setDoc(memberRef, { role }, { merge: true });
  };

  const getUserCommunities = async (
    userId: string
  ): Promise<UserCommunity[]> => {
    const communities: UserCommunity[] = [];

    // Buscar todas as comunidades
    const allCommunities = await getAllCommunities();

    // Para cada comunidade, verificar se o usuário é membro
    for (const community of allCommunities) {
      const memberRef = doc(db, "communities", community.id, "members", userId);
      const memberDoc = await getDoc(memberRef);

      if (memberDoc.exists()) {
        const memberData = memberDoc.data() as {
          role: string;
          joinedAt: number;
        };
        communities.push({
          communityId: community.id,
          role: memberData.role,
          joinedAt: memberData.joinedAt,
          name: community.name,
          logoUrl: community.logoUrl,
        });
      }
    }

    return communities;
  };

  const isCommunityAdmin = async (
    userId: string,
    communityId: string
  ): Promise<boolean> => {
    const memberRef = doc(db, "communities", communityId, "members", userId);
    const memberDoc = await getDoc(memberRef);

    if (memberDoc.exists()) {
      const memberData = memberDoc.data() as { role: string };
      return memberData.role === "admin";
    }

    return false;
  };

  const isCommunityMember = async (
    userId: string,
    communityId: string
  ): Promise<boolean> => {
    const memberRef = doc(db, "communities", communityId, "members", userId);
    const memberDoc = await getDoc(memberRef);

    if (memberDoc.exists()) {
      const memberData = memberDoc.data() as { role: string };
      return (
        memberData.role === "member" ||
        memberData.role === "editor" ||
        memberData.role === "admin"
      );
    }

    return false;
  };

  // Funções para gerenciar eventos
  const getAllEvents = async (): Promise<Event[]> => {
    const querySnapshot = await getDocs(collection(db, "events"));
    const events: Event[] = [];

    for (const eventDoc of querySnapshot.docs) {
      const eventData = eventDoc.data() as EventData;

      // Buscar contagem de interessados
      const interestedSnapshot = await getDocs(
        collection(db, "events", eventDoc.id, "interested")
      );

      // Buscar contagem de confirmados
      const attendeesSnapshot = await getDocs(
        collection(db, "events", eventDoc.id, "attendees")
      );

      events.push({
        id: eventDoc.id,
        ...eventData,
        interestedCount: interestedSnapshot.size,
        attendeesCount: attendeesSnapshot.size,
      });
    }

    // Ordenar por data (mais próximos primeiro)
    return events.sort((a, b) => a.date - b.date);
  };

  const getEvent = async (id: string): Promise<Event | null> => {
    const docRef = doc(db, "events", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const eventData = docSnap.data() as EventData;

      // Buscar contagem de interessados
      const interestedSnapshot = await getDocs(
        collection(db, "events", id, "interested")
      );

      // Buscar contagem de confirmados
      const attendeesSnapshot = await getDocs(
        collection(db, "events", id, "attendees")
      );

      return {
        id,
        ...eventData,
        interestedCount: interestedSnapshot.size,
        attendeesCount: attendeesSnapshot.size,
      };
    } else {
      return null;
    }
  };

  const createEvent = async (data: EventData): Promise<string> => {
    // Create a clean object without undefined values
    const cleanData: Record<string, any> = {};

    // Only add defined values to the clean object
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });

    const docRef = await addDoc(collection(db, "events"), {
      ...cleanData,
      createdAt: Date.now(),
    });

    return docRef.id;
  };

  const updateEvent = async (id: string, data: EventData): Promise<void> => {
    await updateDoc(doc(db, "events", id), { ...data });
  };

  const deleteEvent = async (id: string): Promise<void> => {
    // Primeiro, excluir todos os interessados e confirmados
    const interestedSnapshot = await getDocs(
      collection(db, "events", id, "interested")
    );
    const attendeesSnapshot = await getDocs(
      collection(db, "events", id, "attendees")
    );

    const deleteInterestedPromises = interestedSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    const deleteAttendeesPromises = attendeesSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );

    await Promise.all([
      ...deleteInterestedPromises,
      ...deleteAttendeesPromises,
    ]);

    // Depois, excluir o evento
    await deleteDoc(doc(db, "events", id));
  };

  const showInterestInEvent = async (
    userId: string,
    eventId: string
  ): Promise<void> => {
    await setDoc(doc(db, "events", eventId, "interested", userId), {
      userId,
      joinedAt: Date.now(),
    });
  };

  const confirmAttendanceToEvent = async (
    userId: string,
    eventId: string
  ): Promise<void> => {
    await setDoc(doc(db, "events", eventId, "attendees", userId), {
      userId,
      joinedAt: Date.now(),
    });
  };

  const removeInterestFromEvent = async (
    userId: string,
    eventId: string
  ): Promise<void> => {
    await deleteDoc(doc(db, "events", eventId, "interested", userId));
  };

  const removeAttendanceFromEvent = async (
    userId: string,
    eventId: string
  ): Promise<void> => {
    await deleteDoc(doc(db, "events", eventId, "attendees", userId));
  };

  const getEventInterested = async (
    eventId: string
  ): Promise<EventParticipant[]> => {
    const interestedSnapshot = await getDocs(
      collection(db, "events", eventId, "interested")
    );
    const interested: EventParticipant[] = [];

    for (const interestedDoc of interestedSnapshot.docs) {
      const interestedData = interestedDoc.data() as Omit<
        EventParticipant,
        "firstName" | "lastName" | "photoURL"
      >;

      // Buscar informações do perfil do usuário
      const userProfile = await getUserProfile(interestedData.userId);

      interested.push({
        ...interestedData,
        firstName: userProfile?.firstName,
        lastName: userProfile?.lastName,
        photoURL: userProfile?.photoURL,
      });
    }

    return interested;
  };

  const getEventAttendees = async (
    eventId: string
  ): Promise<EventParticipant[]> => {
    const attendeesSnapshot = await getDocs(
      collection(db, "events", eventId, "attendees")
    );
    const attendees: EventParticipant[] = [];

    for (const attendeeDoc of attendeesSnapshot.docs) {
      const attendeeData = attendeeDoc.data() as Omit<
        EventParticipant,
        "firstName" | "lastName" | "photoURL"
      >;

      // Buscar informações do perfil do usuário
      const userProfile = await getUserProfile(attendeeData.userId);

      attendees.push({
        ...attendeeData,
        firstName: userProfile?.firstName,
        lastName: userProfile?.lastName,
        photoURL: userProfile?.photoURL,
      });
    }

    return attendees;
  };

  const getUserEvents = async (userId: string): Promise<UserEvent[]> => {
    const userEvents: UserEvent[] = [];

    // Buscar eventos em que o usuário está interessado
    const interestedSnapshot = await getDocs(collection(db, "events"));

    for (const eventDoc of interestedSnapshot.docs) {
      const eventId = eventDoc.id;

      // Verificar se o usuário está interessado
      const interestedRef = doc(db, "events", eventId, "interested", userId);
      const interestedDoc = await getDoc(interestedRef);

      if (interestedDoc.exists()) {
        const interestedData = interestedDoc.data() as { joinedAt: number };
        const eventData = eventDoc.data() as EventData;

        userEvents.push({
          eventId,
          status: "interested",
          joinedAt: interestedData.joinedAt,
          title: eventData.title,
          date: eventData.date,
        });
      }

      // Verificar se o usuário confirmou presença
      const attendeeRef = doc(db, "events", eventId, "attendees", userId);
      const attendeeDoc = await getDoc(attendeeRef);

      if (attendeeDoc.exists()) {
        const attendeeData = attendeeDoc.data() as { joinedAt: number };
        const eventData = eventDoc.data() as EventData;

        userEvents.push({
          eventId,
          status: "attending",
          joinedAt: attendeeData.joinedAt,
          title: eventData.title,
          date: eventData.date,
        });
      }
    }

    return userEvents;
  };

  const getContributor = async (
    userId: string
  ): Promise<Contributor | null> => {
    const docRef = doc(db, "contributors", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Omit<
        Contributor,
        "id" | "firstName" | "lastName" | "photoURL"
      >;

      return data as Contributor;
    } else {
      return null;
    }
  };

  // Funções para contribuidores
  const getAllContributors = async (): Promise<Contributor[]> => {
    const querySnapshot = await getDocs(collection(db, "contributors"));
    const contributors: Contributor[] = [];

    for (const contributorDoc of querySnapshot.docs) {
      const contributorData = contributorDoc.data() as Omit<
        Contributor,
        "id" | "firstName" | "lastName" | "photoURL"
      >;

      // Buscar informações do perfil do usuário
      const userProfile = await getUserProfile(contributorData.userId);

      contributors.push({
        id: contributorDoc.id,
        ...contributorData,
        firstName: userProfile?.firstName,
        lastName: userProfile?.lastName,
        photoURL: userProfile?.photoURL,
        githubUrl: userProfile?.githubUrl,
        linkedinUrl: userProfile?.linkedinUrl,
      });
    }

    return contributors;
  };

  const createContributor = async (data: ContributorData): Promise<string> => {
    // Create a clean object without undefined values
    const cleanData: Record<string, any> = {};

    // Only add defined values to the clean object
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });

    const docRef = await addDoc(collection(db, "contributors"), {
      ...cleanData,
    });

    return docRef.id;
  };

  // Funções para gerenciar projetos
  const getAllProjects = async (): Promise<Project[]> => {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const projects: Project[] = [];

    for (const projectDoc of querySnapshot.docs) {
      const projectData = projectDoc.data() as ProjectData;

      // Buscar nome do autor se não estiver incluído
      let authorName = projectData.authorName;
      if (!authorName && projectData.authorId) {
        const userProfile = await getUserProfile(projectData.authorId);
        authorName = userProfile
          ? `${userProfile.firstName} ${userProfile.lastName}`
          : "Usuário desconhecido";
      }

      projects.push({
        id: projectDoc.id,
        ...projectData,
        authorName,
      });
    }

    // Ordenar por data de criação (mais recentes primeiro)
    return projects.sort((a, b) => b.createdAt - a.createdAt);
  };

  const getProject = async (id: string): Promise<Project | null> => {
    const docRef = doc(db, "projects", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const projectData = docSnap.data() as ProjectData;

      // Buscar nome do autor se não estiver incluído
      let authorName = projectData.authorName;
      if (!authorName && projectData.authorId) {
        const userProfile = await getUserProfile(projectData.authorId);
        authorName = userProfile
          ? `${userProfile.firstName} ${userProfile.lastName}`
          : "Usuário desconhecido";
      }

      return {
        id: docSnap.id,
        ...projectData,
        authorName,
      };
    } else {
      return null;
    }
  };

  const createProject = async (data: ProjectData): Promise<string> => {
    // Garantir que o campo createdAt esteja presente
    const projectData = {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Adicionar nome do autor se não estiver incluído
    if (!projectData.authorName && projectData.authorId) {
      const userProfile = await getUserProfile(projectData.authorId);
      if (userProfile) {
        projectData.authorName = `${userProfile.firstName} ${userProfile.lastName}`;
      }
    }

    const docRef = await addDoc(collection(db, "projects"), projectData);
    return docRef.id;
  };

  const updateProject = async (
    id: string,
    data: Partial<ProjectData>
  ): Promise<void> => {
    // Adicionar campo updatedAt
    const updateData = {
      ...data,
      updatedAt: Date.now(),
    };

    await updateDoc(doc(db, "projects", id), updateData);
  };

  const deleteProject = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "projects", id));
  };

  const getUserProjects = async (userId: string): Promise<Project[]> => {
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, where("authorId", "==", userId));
    const querySnapshot = await getDocs(q);

    const projects: Project[] = [];

    for (const projectDoc of querySnapshot.docs) {
      const projectData = projectDoc.data() as ProjectData;

      projects.push({
        id: projectDoc.id,
        ...projectData,
      });
    }

    // Ordenar por data de criação (mais recentes primeiro)
    return projects.sort((a, b) => b.createdAt - a.createdAt);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        // auth functions
        signUp,
        signIn,
        logout,
        verifyEmail,
        recoverPassword,
        // profile functions
        createUserProfile,
        getUserProfile,
        updateUserProfile,
        uploadProfilePhoto,
        deleteProfilePhoto,
        getAllProfiles,
        // community functions
        getAllCommunities,
        getAdminCommunities,
        getCommunity,
        createCommunity,
        updateCommunity,
        deleteCommunity,
        joinCommunity,
        leaveCommunity,
        getCommunityMembers,
        updateMemberRole,
        getUserCommunities,
        isCommunityAdmin,
        isCommunityMember,
        // events functions
        getAllEvents,
        getEvent,
        createEvent,
        updateEvent,
        deleteEvent,
        showInterestInEvent,
        confirmAttendanceToEvent,
        removeInterestFromEvent,
        removeAttendanceFromEvent,
        getEventInterested,
        getEventAttendees,
        getUserEvents,
        // contributors
        getContributor,
        getAllContributors,
        createContributor,
        // projects
        getAllProjects,
        getProject,
        createProject,
        updateProject,
        deleteProject,
        getUserProjects,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
