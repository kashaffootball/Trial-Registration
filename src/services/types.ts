export interface BackendlessUser {
  objectId: string;
  email: string;
  userToken?: string;
  userType?: 'player' | 'club';
  isEmailVerified?: boolean;
  isActive?: boolean;
  isTestAccount?: boolean;
  [key: string]: unknown;
}

export interface Player {
  objectId: string;
  user: BackendlessUser;
  fullName: string;
  dateOfBirth: string;
  city: string;
  height: number;
  weight: number;
  preferredFoot: 'left' | 'right' | 'both';
  position: string;
  bio: string;
  profileImageUrl: string;
  created: number;
  updated?: number;
}

export interface Club {
  objectId: string;
  user: string;
  clubName: string;
  location: string;
  foundedYear: number;
  description: string;
  logoUrl?: string;
  hasStadium: boolean;
  hasGym: boolean;
  hasMedicalCenter: boolean;
  hasHousing: boolean;
  instapayLink?: string;
  whatsappNumber?: string;
  created: number;
  updated?: number;
}

export interface Trial {
  objectId: string;
  clubId: string;
  ownerId: string;
  trialName: string;
  trialDateTime: number | null;
  location: string;
  mapsLink?: string | null;
  maxParticipants: number;
  remainingSeats: number;
  price: number;
  maxAge: number;
  minAge: number;
  positions: string | null;
  description: string;
  coverImageUrl: string | null;
  isActive: boolean;
  created: number;
  updated?: number | null;
  club?:
    | {
        objectId: string;
        clubName?: string;
        logoUrl?: string | null;
        instapayLink?: string;
        whatsappNumber?: string;
      }
    | {
        objectId: string;
        clubName?: string;
        logoUrl?: string | null;
        instapayLink?: string;
        whatsappNumber?: string;
      }[]
    | null;
}

export interface TrialApplication {
  objectId: string;
  status: 'applied' | 'accepted' | 'rejected';
  paymentStatus: 'pending' | 'paid' | 'rejected';
  paymentMethod?: string;
  qrCode?: string | null;
  created: number;
  updated?: number | null;
  player?: Player[] | null;
  trial?: Trial[] | null;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface FileUploadResult {
  fileURL: string;
  name: string;
}

export interface CreatePlayerProfileParams {
  fullName: string;
  dateOfBirth: string;
  city: string;
  height: number;
  weight: number;
  preferredFoot: 'left' | 'right' | 'both';
  position: string;
  bio: string;
  profileImageUrl?: string;
}
