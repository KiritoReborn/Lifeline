// Base API URL - adjust this to match your backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ============================================================================
// Type Definitions (matching Java backend models)
// ============================================================================

// Enums (as const objects for TypeScript compatibility)
export const BedType = {
  ICU: 'ICU',
  VENTILATOR: 'VENTILATOR',
  GENERAL: 'GENERAL',
} as const;

export type BedType = typeof BedType[keyof typeof BedType];

export const BedStatus = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export type BedStatus = typeof BedStatus[keyof typeof BedStatus];

export const ReservationStatus = {
  RESERVED: 'RESERVED',
  EXPIRED: 'EXPIRED',
  CONFIRMED: 'CONFIRMED',
} as const;

export type ReservationStatus = typeof ReservationStatus[keyof typeof ReservationStatus];

// Hospital Types
export interface HospitalResponseDTO {
  id: number;
  name: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  hospitalCategory?: string;
  hospitalCareType?: string;
  disciplineSystemsOfMedicine?: string;
  state?: string;
  district?: string;
  subdistrict?: string;
  pincode?: string;
  telephone?: string;
  mobileNumber?: string;
  emergencyNum?: string;
  ambulancePhoneNo?: string;
  bloodbankPhoneNo?: string;
  tollfree?: string;
  helpline?: string;
  hospitalFax?: string;
  hospitalSecondaryEmailId?: string;
  website?: string;
  specialties?: string;
  facilities?: string;
  accreditation?: string;
  hospitalRegisNumber?: string;
  town?: string;
  subtown?: string;
  village?: string;
  establishedYear?: string;
  miscellaneousFacilities?: string;
  numberDoctor?: number;
  numMediconsultantOrExpert?: number;
  totalNumBeds?: number;
  numberPrivateWards?: number;
  numBedForEcoWeakerSec?: number;
  empanelmentOrCollaborationWith?: string;
  emergencyServices?: string;
  tariffRange?: string;
  stateId?: string;
  districtId?: string;
  createdAt?: string; // ISO 8601 date string
  updatedAt?: string; // ISO 8601 date string
}

export interface HospitalCreateDTO {
  name: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  latitude: number;
  longitude: number;
  location?: string;
  hospitalCategory?: string;
  hospitalCareType?: string;
  disciplineSystemsOfMedicine?: string;
  state?: string;
  district?: string;
  subdistrict?: string;
  pincode?: string;
  telephone?: string;
  mobileNumber?: string;
  emergencyNum?: string;
  ambulancePhoneNo?: string;
  bloodbankPhoneNo?: string;
  tollfree?: string;
  helpline?: string;
  hospitalFax?: string;
  hospitalSecondaryEmailId?: string;
  website?: string;
  specialties?: string;
  facilities?: string;
  accreditation?: string;
  hospitalRegisNumber?: string;
  town?: string;
  subtown?: string;
  village?: string;
  establishedYear?: string;
  miscellaneousFacilities?: string;
  numberDoctor?: number;
  numMediconsultantOrExpert?: number;
  totalNumBeds?: number;
  numberPrivateWards?: number;
  numBedForEcoWeakerSec?: number;
  empanelmentOrCollaborationWith?: string;
  emergencyServices?: string;
  tariffRange?: string;
  stateId?: string;
  districtId?: string;
}

export interface HospitalSearchCriteria {
  keyword?: string;
  state?: string;
  district?: string;
  category?: string;
  careType?: string;
  minBeds?: number;
  emergencyService?: string;
  specialty?: string;
  facility?: string;
}

export interface NearbyHospitalRequest {
  latitude: number;
  longitude: number;
  radiusKm: number;
  minBeds?: number;
  category?: string;
  emergencyService?: string;
}

export interface NearbyHospitalResponse extends HospitalResponseDTO {
  distanceKm?: number;
}

export interface HospitalStats {
  totalHospitals: number;
  message: string;
}

// Bed Types
export interface BedResponseDTO {
  id: number;
  bedNumber: string;
  hospitalId: number;
  bedType: BedType;
  bedStatus: BedStatus;
  createdAt?: string; // ISO 8601 date string
  updatedAt?: string; // ISO 8601 date string
}

export interface BedCreateDTO {
  hospitalId: number;
  bedNumber: string;
  bedType: BedType;
}

export interface BedStatusUpdateDTO {
  bedStatus: BedStatus;
}

export interface BedCountResponseDTO {
  count: number;
}

// Ambulance Types
export interface AmbulanceRequestDTO {
  ambulanceId: string;
  latitude: number;
  longitude: number;
  requiredBedType: string; // "ICU" or "VENTILATOR"
}

export interface HospitalMatchDTO {
  hospitalId: number;
  hospitalName: string;
  distanceInKm: number;
  availableBeds: number;
  bedId: number;
  // Route information from GraphHopper
  etaMinutes?: number;
  encodedPolyline?: string;
  routeCoordinates?: number[][];
}

// Pagination Types (Spring Page<T> structure)
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page (0-indexed)
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Sort direction
export type SortDirection = 'ASC' | 'DESC';

// ============================================================================
// API Client Helper Functions
// ============================================================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
    }

    // Handle empty responses (e.g., 204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    // Provide more helpful error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Failed to connect to backend at ${url}. ` +
        `Please ensure the backend server is running on ${API_BASE_URL}. ` +
        `If using a different port, set VITE_API_BASE_URL environment variable.`
      );
    }
    throw error;
  }
}

function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ============================================================================
// Hospital API Functions
// ============================================================================

export const hospitalApi = {
  /**
   * Create a new hospital
   */
  createHospital: async (data: HospitalCreateDTO): Promise<HospitalResponseDTO> => {
    return apiRequest<HospitalResponseDTO>('/api/hospitals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all hospitals with pagination and sorting
   */
  getAllHospitals: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: SortDirection;
  }): Promise<Page<HospitalResponseDTO>> => {
    const queryParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sortBy: params?.sortBy ?? 'name',
      sortDir: params?.sortDir ?? 'ASC',
    };
    return apiRequest<Page<HospitalResponseDTO>>(
      `/api/hospitals${buildQueryString(queryParams)}`
    );
  },

  /**
   * Search hospitals with filters
   */
  searchHospitals: async (criteria: HospitalSearchCriteria & {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: SortDirection;
  }): Promise<Page<HospitalResponseDTO>> => {
    const queryParams = {
      keyword: criteria.keyword,
      state: criteria.state,
      district: criteria.district,
      category: criteria.category,
      careType: criteria.careType,
      minBeds: criteria.minBeds,
      emergencyService: criteria.emergencyService,
      specialty: criteria.specialty,
      facility: criteria.facility,
      page: criteria.page ?? 0,
      size: criteria.size ?? 20,
      sortBy: criteria.sortBy ?? 'name',
      sortDir: criteria.sortDir ?? 'ASC',
    };
    return apiRequest<Page<HospitalResponseDTO>>(
      `/api/hospitals/search${buildQueryString(queryParams)}`
    );
  },

  /**
   * Get hospital by ID
   */
  getHospitalById: async (id: number): Promise<HospitalResponseDTO> => {
    return apiRequest<HospitalResponseDTO>(`/api/hospitals/${id}`);
  },

  /**
   * Update hospital by ID
   */
  updateHospital: async (
    id: number,
    data: HospitalCreateDTO
  ): Promise<HospitalResponseDTO> => {
    return apiRequest<HospitalResponseDTO>(`/api/hospitals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get hospital statistics
   */
  getHospitalStats: async (): Promise<HospitalStats> => {
    return apiRequest<HospitalStats>('/api/hospitals/stats');
  },

  /**
   * Find nearby hospitals
   */
  findNearbyHospitals: async (
    request: NearbyHospitalRequest,
    params?: {
      page?: number;
      size?: number;
    }
  ): Promise<Page<NearbyHospitalResponse>> => {
    const queryParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    };
    return apiRequest<Page<NearbyHospitalResponse>>(
      `/api/hospitals/nearby${buildQueryString(queryParams)}`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  },
};

// ============================================================================
// Bed API Functions
// ============================================================================

export const bedApi = {
  /**
   * Create a new bed
   */
  createBed: async (data: BedCreateDTO): Promise<BedResponseDTO> => {
    return apiRequest<BedResponseDTO>('/api/beds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update bed status
   */
  updateBedStatus: async (
    bedId: number,
    data: BedStatusUpdateDTO
  ): Promise<BedResponseDTO> => {
    return apiRequest<BedResponseDTO>(`/api/beds/${bedId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get available beds for a hospital and bed type
   */
  getAvailableBeds: async (
    hospitalId: number,
    bedType: BedType
  ): Promise<BedResponseDTO[]> => {
    const queryParams = {
      hospitalId: hospitalId.toString(),
      bedType: bedType,
    };
    return apiRequest<BedResponseDTO[]>(
      `/api/beds/available${buildQueryString(queryParams)}`
    );
  },

  /**
   * Get all beds for a hospital
   */
  getBedsByHospital: async (
    hospitalId: number
  ): Promise<BedResponseDTO[]> => {
    return apiRequest<BedResponseDTO[]>(`/api/beds/hospital/${hospitalId}`);
  },

  /**
   * Get count of available beds for a hospital and bed type
   */
  getAvailableBedCount: async (
    hospitalId: number,
    bedType: BedType
  ): Promise<BedCountResponseDTO> => {
    const queryParams = {
      hospitalId: hospitalId.toString(),
      bedType: bedType,
    };
    return apiRequest<BedCountResponseDTO>(
      `/api/beds/available/count${buildQueryString(queryParams)}`
    );
  },

  /**
   * Update bed details (bed number and type)
   */
  updateBed: async (
    bedId: number,
    data: { bedNumber?: string; bedType?: BedType }
  ): Promise<BedResponseDTO> => {
    return apiRequest<BedResponseDTO>(`/api/beds/${bedId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a bed
   */
  deleteBed: async (bedId: number): Promise<void> => {
    return apiRequest<void>(`/api/beds/${bedId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Ambulance API Functions
// ============================================================================

export const ambulanceApi = {
  /**
   * Find the nearest hospital with an available bed matching the required type.
   * Creates a 15-minute reservation for the matched bed.
   */
  findNearestHospital: async (
    request: AmbulanceRequestDTO
  ): Promise<HospitalMatchDTO> => {
    return apiRequest<HospitalMatchDTO>('/api/ambulance/find-nearest', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};

// ============================================================================
// Default Export (convenience object with all APIs)
// ============================================================================

const api = {
  hospitals: hospitalApi,
  beds: bedApi,
  ambulance: ambulanceApi,
};

export default api;
