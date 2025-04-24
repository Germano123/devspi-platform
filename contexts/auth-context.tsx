"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth"
import { auth, db, storage } from "@/lib/firebase"
import { doc, setDoc, getDoc, getDocs, collection, deleteDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  createUserProfile: (userId: string, data: ProfileData) => Promise<void>
  getUserProfile: (userId: string) => Promise<ProfileData | null>
  updateUserProfile: (userId: string, data: ProfileData) => Promise<void>
  uploadProfilePhoto: (userId: string, file: File) => Promise<string>
  deleteProfilePhoto: (userId: string, photoURL: string) => Promise<void>
  getAllProfiles: () => Promise<(ProfileData & { id: string })[]>

  // Funções para comunidades
  getAllCommunities: () => Promise<Community[]>
  getCommunity: (id: string) => Promise<Community | null>
  createCommunity: (data: CommunityData) => Promise<string>
  updateCommunity: (id: string, data: CommunityData) => Promise<void>
  deleteCommunity: (id: string) => Promise<void>

  // Funções para gerenciamento de comunidades
  joinCommunity: (userId: string, communityId: string, role?: string) => Promise<void>
  leaveCommunity: (userId: string, communityId: string) => Promise<void>
  getCommunityMembers: (communityId: string) => Promise<CommunityMember[]>
  updateMemberRole: (communityId: string, userId: string, role: string) => Promise<void>
  getUserCommunities: (userId: string) => Promise<UserCommunity[]>
  isCommunityAdmin: (userId: string, communityId: string) => Promise<boolean>
  isCommunityMember: (userId: string, communityId: string) => Promise<boolean>
}

export interface ProfileData {
  firstName: string
  lastName: string
  linkedinUrl: string
  areaAtuacao: string[] // Array de strings
  tempoExperiencia: string
  nivelEnsino: string
  photoURL?: string
}

export interface CommunityData {
  name: string
  bio: string
  whatsappLink: string
  websiteLink: string
  logoUrl?: string
  isPrivate: boolean
  createdBy: string
  createdAt: number
}

export interface Community extends CommunityData {
  id: string
}

export interface CommunityMember {
  userId: string
  role: string // 'admin', 'editor', 'member'
  joinedAt: number
  firstName?: string
  lastName?: string
  photoURL?: string
}

export interface UserCommunity {
  communityId: string
  role: string
  joinedAt: number
  name?: string
  logoUrl?: string
}

// Lista de emails de administradores
const ADMIN_EMAILS = ["admin@devparnaiba.com.br", "root@devparnaiba.com.br"]

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let unsubscribe = () => {}

    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          setUser(user)
          // Verificar se o usuário é admin
          setIsAdmin(user ? ADMIN_EMAILS.includes(user.email || "") : false)
          setLoading(false)
        },
        (error) => {
          console.error("Auth state change error:", error)
          setUser(null)
          setIsAdmin(false)
          setLoading(false)
        },
      )
    } catch (error) {
      console.error("Failed to set up auth state listener:", error)
      setUser(null)
      setIsAdmin(false)
      setLoading(false)
    }

    return () => {
      try {
        unsubscribe()
      } catch (error) {
        console.error("Error unsubscribing from auth state:", error)
      }
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const createUserProfile = async (userId: string, data: ProfileData) => {
    await setDoc(doc(db, "profiles", userId), data)
  }

  const getUserProfile = async (userId: string): Promise<ProfileData | null> => {
    const docRef = doc(db, "profiles", userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data() as Omit<ProfileData, "areaAtuacao"> & { areaAtuacao: string | string[] }

      // Garantir que areaAtuacao seja sempre um array
      if (typeof data.areaAtuacao === "string") {
        return {
          ...data,
          areaAtuacao: [data.areaAtuacao],
        } as ProfileData
      }

      return data as ProfileData
    } else {
      return null
    }
  }

  const updateUserProfile = async (userId: string, data: ProfileData) => {
    await setDoc(doc(db, "profiles", userId), data, { merge: true })
  }

  // Função para upload de foto de perfil
  const uploadProfilePhoto = async (userId: string, file: File): Promise<string> => {
    const fileExtension = file.name.split(".").pop()
    const fileName = `profile_photos/${userId}_${Date.now()}.${fileExtension}`
    const storageRef = ref(storage, fileName)

    await uploadBytes(storageRef, file)
    const photoURL = await getDownloadURL(storageRef)

    // Atualizar o perfil do usuário com a URL da foto
    await updateUserProfile(userId, { photoURL } as ProfileData)

    return photoURL
  }

  // Função para excluir foto de perfil
  const deleteProfilePhoto = async (userId: string, photoURL: string): Promise<void> => {
    try {
      // Extrair o caminho do arquivo da URL
      const fileRef = ref(storage, photoURL)
      await deleteObject(fileRef)

      // Atualizar o perfil do usuário removendo a URL da foto
      await updateUserProfile(userId, { photoURL: null } as unknown as ProfileData)
    } catch (error) {
      console.error("Erro ao excluir foto:", error)
      // Se não conseguir excluir o arquivo, pelo menos remove a referência no perfil
      await updateUserProfile(userId, { photoURL: null } as unknown as ProfileData)
    }
  }

  const getAllProfiles = async (): Promise<(ProfileData & { id: string })[]> => {
    const querySnapshot = await getDocs(collection(db, "profiles"))
    const profiles: (ProfileData & { id: string })[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<ProfileData, "areaAtuacao"> & { areaAtuacao: string | string[] }

      // Garantir que areaAtuacao seja sempre um array
      let areaAtuacao: string[]
      if (typeof data.areaAtuacao === "string") {
        areaAtuacao = [data.areaAtuacao]
      } else {
        areaAtuacao = data.areaAtuacao || []
      }

      profiles.push({
        id: doc.id,
        ...data,
        areaAtuacao,
      } as ProfileData & { id: string })
    })

    return profiles
  }

  // Funções para gerenciar comunidades
  const getAllCommunities = async (): Promise<Community[]> => {
    const querySnapshot = await getDocs(collection(db, "communities"))
    const communities: Community[] = []

    querySnapshot.forEach((doc) => {
      communities.push({
        id: doc.id,
        ...(doc.data() as CommunityData),
      })
    })

    // Ordenar por nome
    return communities.sort((a, b) => a.name.localeCompare(b.name))
  }

  const getCommunity = async (id: string): Promise<Community | null> => {
    const docRef = doc(db, "communities", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...(docSnap.data() as CommunityData),
      }
    } else {
      return null
    }
  }

  const createCommunity = async (data: CommunityData): Promise<string> => {
    const docRef = doc(collection(db, "communities"))
    await setDoc(docRef, {
      ...data,
      createdAt: Date.now(),
    })

    // Adicionar o criador como admin da comunidade
    if (data.createdBy) {
      await joinCommunity(data.createdBy, docRef.id, "admin")
    }

    return docRef.id
  }

  const updateCommunity = async (id: string, data: CommunityData): Promise<void> => {
    await setDoc(doc(db, "communities", id), data, { merge: true })
  }

  const deleteCommunity = async (id: string): Promise<void> => {
    // Primeiro, excluir todos os membros da comunidade
    const membersSnapshot = await getDocs(collection(db, "communities", id, "members"))
    const deletePromises = membersSnapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    // Depois, excluir a comunidade
    await deleteDoc(doc(db, "communities", id))
  }

  // Funções para gerenciamento de membros da comunidade
  const joinCommunity = async (userId: string, communityId: string, role = "member"): Promise<void> => {
    const memberRef = doc(db, "communities", communityId, "members", userId)

    // Verificar se a comunidade é privada
    const community = await getCommunity(communityId)
    if (community?.isPrivate && role === "member") {
      // Se for privada, o status inicial é 'pending'
      await setDoc(memberRef, {
        userId,
        role: "pending",
        joinedAt: Date.now(),
      })
    } else {
      // Se não for privada ou se o papel for diferente de 'member', adicionar diretamente
      await setDoc(memberRef, {
        userId,
        role,
        joinedAt: Date.now(),
      })
    }
  }

  const leaveCommunity = async (userId: string, communityId: string): Promise<void> => {
    await deleteDoc(doc(db, "communities", communityId, "members", userId))
  }

  const getCommunityMembers = async (communityId: string): Promise<CommunityMember[]> => {
    const membersSnapshot = await getDocs(collection(db, "communities", communityId, "members"))
    const members: CommunityMember[] = []

    for (const memberDoc of membersSnapshot.docs) {
      const memberData = memberDoc.data() as Omit<CommunityMember, "firstName" | "lastName" | "photoURL">

      // Buscar informações do perfil do usuário
      const userProfile = await getUserProfile(memberData.userId)

      members.push({
        ...memberData,
        firstName: userProfile?.firstName,
        lastName: userProfile?.lastName,
        photoURL: userProfile?.photoURL,
      })
    }

    return members
  }

  const updateMemberRole = async (communityId: string, userId: string, role: string): Promise<void> => {
    const memberRef = doc(db, "communities", communityId, "members", userId)
    await setDoc(memberRef, { role }, { merge: true })
  }

  const getUserCommunities = async (userId: string): Promise<UserCommunity[]> => {
    const communities: UserCommunity[] = []

    // Buscar todas as comunidades
    const allCommunities = await getAllCommunities()

    // Para cada comunidade, verificar se o usuário é membro
    for (const community of allCommunities) {
      const memberRef = doc(db, "communities", community.id, "members", userId)
      const memberDoc = await getDoc(memberRef)

      if (memberDoc.exists()) {
        const memberData = memberDoc.data() as { role: string; joinedAt: number }
        communities.push({
          communityId: community.id,
          role: memberData.role,
          joinedAt: memberData.joinedAt,
          name: community.name,
          logoUrl: community.logoUrl,
        })
      }
    }

    return communities
  }

  const isCommunityAdmin = async (userId: string, communityId: string): Promise<boolean> => {
    const memberRef = doc(db, "communities", communityId, "members", userId)
    const memberDoc = await getDoc(memberRef)

    if (memberDoc.exists()) {
      const memberData = memberDoc.data() as { role: string }
      return memberData.role === "admin"
    }

    return false
  }

  const isCommunityMember = async (userId: string, communityId: string): Promise<boolean> => {
    const memberRef = doc(db, "communities", communityId, "members", userId)
    const memberDoc = await getDoc(memberRef)

    if (memberDoc.exists()) {
      const memberData = memberDoc.data() as { role: string }
      return memberData.role === "member" || memberData.role === "editor" || memberData.role === "admin"
    }

    return false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        signUp,
        signIn,
        logout,
        createUserProfile,
        getUserProfile,
        updateUserProfile,
        uploadProfilePhoto,
        deleteProfilePhoto,
        getAllProfiles,
        getAllCommunities,
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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
