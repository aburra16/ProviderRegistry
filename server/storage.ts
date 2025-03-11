import { 
  Provider, InsertProvider, 
  Specialty, InsertSpecialty,
  InsurancePlan, InsertInsurancePlan,
  ProviderFilter
} from "@shared/schema";

export interface IStorage {
  // Provider methods
  getProviders(options?: { page: number, limit: number, sort?: string }): Promise<{ providers: Provider[], total: number, location?: string }>;
  getProvider(id: number): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  searchProviders(filter: ProviderFilter): Promise<{ providers: Provider[], total: number, location?: string }>;

  // Specialty methods
  getSpecialties(): Promise<string[]>;
  createSpecialty(specialty: InsertSpecialty): Promise<Specialty>;

  // Insurance plan methods
  getInsurancePlans(): Promise<string[]>;
  createInsurancePlan(plan: InsertInsurancePlan): Promise<InsurancePlan>;
}

export class MemStorage implements IStorage {
  private providers: Map<number, Provider>;
  private specialties: Set<string>;
  private insurancePlans: Set<string>;
  private currentProviderId: number;
  private currentSpecialtyId: number;
  private currentInsurancePlanId: number;

  constructor() {
    this.providers = new Map();
    this.specialties = new Set([
      "Primary Care", "Cardiology", "Dermatology", "Orthopedics", 
      "Neurology", "Psychiatry", "Pediatrics", "Gynecology",
      "Ophthalmology", "Dentistry", "Physical Therapy"
    ]);
    this.insurancePlans = new Set([
      "Aetna", "Blue Cross Blue Shield", "Cigna", "Humana", 
      "Medicaid", "Medicare", "UnitedHealthcare", "Oscar",
      "Kaiser Permanente", "Anthem"
    ]);
    this.currentProviderId = 1;
    this.currentSpecialtyId = 1;
    this.currentInsurancePlanId = 1;

    // Seed with example data
    this.seedProviders();
  }

  // Provider methods
  async getProviders(options: { page: number, limit: number, sort?: string } = { page: 1, limit: 10 }): Promise<{ providers: Provider[], total: number, location?: string }> {
    const { page, limit, sort = "relevance" } = options;
    const allProviders = Array.from(this.providers.values());
    
    // Apply sorting
    const sortedProviders = this.sortProviders(allProviders, sort);
    
    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProviders = sortedProviders.slice(start, end);
    
    return {
      providers: paginatedProviders,
      total: allProviders.length,
      location: "New York, NY" // Mock location for example
    };
  }

  async getProvider(id: number): Promise<Provider | undefined> {
    return this.providers.get(id);
  }

  async createProvider(provider: InsertProvider): Promise<Provider> {
    const id = this.currentProviderId++;
    const newProvider = { ...provider, id } as Provider;
    this.providers.set(id, newProvider);
    return newProvider;
  }

  async searchProviders(filter: ProviderFilter): Promise<{ providers: Provider[], total: number, location?: string }> {
    const { page = 1, limit = 10, sort = "relevance" } = filter;
    
    // Clone all providers so we can filter them
    let filteredProviders = Array.from(this.providers.values());
    
    // Apply search query filter if provided
    if (filter.searchQuery && filter.searchQuery !== "") {
      const query = filter.searchQuery.toLowerCase();
      filteredProviders = filteredProviders.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.specialty.toLowerCase().includes(query) ||
        p.displayAddress.toLowerCase().includes(query) ||
        p.bio?.toLowerCase().includes(query) ||
        p.insurances.some(i => i.toLowerCase().includes(query))
      );
    }
    
    // Apply specialty filter
    if (filter.specialty && filter.specialty !== "") {
      filteredProviders = filteredProviders.filter(p => 
        p.specialty.toLowerCase() === filter.specialty?.toLowerCase()
      );
    }
    
    // Apply insurance filter
    if (filter.insurance && filter.insurance !== "") {
      filteredProviders = filteredProviders.filter(p => 
        p.insurances.some(i => i.toLowerCase() === filter.insurance?.toLowerCase())
      );
    }
    
    // Apply availability filters
    if (filter.availability) {
      if (filter.availability.today) {
        filteredProviders = filteredProviders.filter(p => 
          p.nextAvailable && p.nextAvailable.toLowerCase().includes("today")
        );
      }
      if (filter.availability.thisWeek) {
        filteredProviders = filteredProviders.filter(p => 
          p.nextAvailable && (
            p.nextAvailable.toLowerCase().includes("today") || 
            p.nextAvailable.toLowerCase().includes("tomorrow") ||
            p.nextAvailable.toLowerCase().includes("monday") ||
            p.nextAvailable.toLowerCase().includes("tuesday") ||
            p.nextAvailable.toLowerCase().includes("wednesday") ||
            p.nextAvailable.toLowerCase().includes("thursday") ||
            p.nextAvailable.toLowerCase().includes("friday")
          )
        );
      }
      if (filter.availability.weekends) {
        filteredProviders = filteredProviders.filter(p => 
          p.nextAvailable && (
            p.nextAvailable.toLowerCase().includes("saturday") ||
            p.nextAvailable.toLowerCase().includes("sunday")
          )
        );
      }
    }
    
    // Apply additional filters
    if (filter.additional) {
      if (filter.additional.acceptingNewPatients) {
        filteredProviders = filteredProviders.filter(p => p.acceptingNewPatients);
      }
      if (filter.additional.virtualVisits) {
        filteredProviders = filteredProviders.filter(p => p.hasVirtualVisits);
      }
      if (filter.additional.spanishSpeaking) {
        filteredProviders = filteredProviders.filter(p => 
          p.languages.some(l => l.toLowerCase() === "spanish")
        );
      }
    }
    
    // Apply sorting
    const sortedProviders = this.sortProviders(filteredProviders, sort);
    
    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProviders = sortedProviders.slice(start, end);
    
    // Return location based on zip code if provided
    let location: string | undefined = "New York, NY";
    if (filter.zipCode) {
      // In a real app, we would do a zip code lookup
      location = `Area near ${filter.zipCode}`;
    }
    
    return {
      providers: paginatedProviders,
      total: filteredProviders.length,
      location
    };
  }

  // Specialty methods
  async getSpecialties(): Promise<string[]> {
    return Array.from(this.specialties);
  }

  async createSpecialty(specialty: InsertSpecialty): Promise<Specialty> {
    const id = this.currentSpecialtyId++;
    this.specialties.add(specialty.name);
    return { id, ...specialty };
  }

  // Insurance plan methods
  async getInsurancePlans(): Promise<string[]> {
    return Array.from(this.insurancePlans);
  }

  async createInsurancePlan(plan: InsertInsurancePlan): Promise<InsurancePlan> {
    const id = this.currentInsurancePlanId++;
    this.insurancePlans.add(plan.name);
    return { id, ...plan };
  }

  // Helper methods
  private sortProviders(providers: Provider[], sort: string): Provider[] {
    const sortedProviders = [...providers];
    
    switch (sort) {
      case "distance":
        return sortedProviders.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      case "rating":
        return sortedProviders.sort((a, b) => b.rating - a.rating);
      case "availability":
        // Sort first by those available today, then this week
        return sortedProviders.sort((a, b) => {
          const aToday = a.nextAvailable?.toLowerCase().includes("today") ? 1 : 0;
          const bToday = b.nextAvailable?.toLowerCase().includes("today") ? 1 : 0;
          if (aToday !== bToday) return bToday - aToday;
          
          const aTomorrow = a.nextAvailable?.toLowerCase().includes("tomorrow") ? 1 : 0;
          const bTomorrow = b.nextAvailable?.toLowerCase().includes("tomorrow") ? 1 : 0;
          return bTomorrow - aTomorrow;
        });
      case "relevance":
      default:
        // For relevance we'll use a combination of rating and number of reviews
        return sortedProviders.sort((a, b) => 
          (b.rating * Math.log(b.reviewCount + 1)) - 
          (a.rating * Math.log(a.reviewCount + 1))
        );
    }
  }

  private seedProviders() {
    const seedData: InsertProvider[] = [
      {
        name: "Dr. Sarah Johnson",
        title: "MD",
        specialty: "Cardiology",
        profileImage: "",
        facilityName: "Midtown Medical Center",
        distance: 2.3,
        rating: 4.5,
        reviewCount: 128,
        nextAvailable: "Today, 2:30 PM",
        insurances: ["Aetna", "Blue Cross Blue Shield", "Cigna", "Medicare"],
        isInNetwork: true,
        hasVirtualVisits: false,
        languages: ["English", "Spanish"],
        about: "Dr. Sarah Johnson is a board-certified cardiologist with over 10 years of experience treating patients with various heart conditions. She specializes in preventive cardiology, heart failure management, and women's heart health. Dr. Johnson takes a patient-centered approach, focusing on lifestyle modifications alongside medical interventions.",
        education: [
          { degree: "MD, Johns Hopkins School of Medicine", institution: "Johns Hopkins University", graduationYear: "Graduated 2008" },
          { degree: "Cardiology Fellowship, Mount Sinai Hospital", institution: "Mount Sinai Hospital", graduationYear: "Completed 2013" }
        ],
        certifications: [
          { name: "Board Certified in Cardiovascular Disease", organization: "American Board of Internal Medicine" }
        ],
        officeAddress: { 
          street: "123 Park Avenue, Suite 456", 
          city: "New York", 
          state: "NY", 
          zipCode: "10022",
          latitude: 40.7580,
          longitude: -73.9855
        },
        officePhone: "(212) 555-7890",
        officeHours: {
          "Monday": "8:00 AM - 5:00 PM",
          "Tuesday": "8:00 AM - 5:00 PM",
          "Wednesday": "10:00 AM - 7:00 PM",
          "Thursday": "8:00 AM - 5:00 PM",
          "Friday": "8:00 AM - 3:00 PM",
          "Saturday": "9:00 AM - 1:00 PM",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: true
      },
      {
        name: "Dr. Michael Chen",
        title: "MD",
        specialty: "Primary Care",
        profileImage: "",
        facilityName: "Downtown Medical Group",
        distance: 1.8,
        rating: 4.0,
        reviewCount: 97,
        nextAvailable: "Tomorrow, 9:15 AM",
        insurances: ["UnitedHealthcare", "Blue Cross Blue Shield", "Humana", "Medicaid"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English", "Mandarin"],
        about: "Dr. Michael Chen is a primary care physician specializing in preventive medicine and chronic disease management. With his patient-centered approach, Dr. Chen is committed to helping his patients achieve their optimal health through comprehensive care and education.",
        education: [
          { degree: "MD, University of California, San Francisco", institution: "UCSF", graduationYear: "Graduated 2010" },
          { degree: "Residency in Internal Medicine, Stanford Medical Center", institution: "Stanford", graduationYear: "Completed 2013" }
        ],
        certifications: [
          { name: "Board Certified in Internal Medicine", organization: "American Board of Internal Medicine" }
        ],
        officeAddress: { 
          street: "456 Broadway, Floor 3", 
          city: "New York", 
          state: "NY", 
          zipCode: "10013",
          latitude: 40.7209,
          longitude: -73.9988
        },
        officePhone: "(212) 555-1234",
        officeHours: {
          "Monday": "9:00 AM - 6:00 PM",
          "Tuesday": "9:00 AM - 6:00 PM",
          "Wednesday": "9:00 AM - 6:00 PM",
          "Thursday": "9:00 AM - 6:00 PM",
          "Friday": "9:00 AM - 5:00 PM",
          "Saturday": "Closed",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. Alex Rodriguez",
        title: "MD",
        specialty: "Dermatology",
        profileImage: "",
        facilityName: "East Village Dermatology",
        distance: 3.5,
        rating: 5.0,
        reviewCount: 213,
        nextAvailable: "Friday, 1:00 PM",
        insurances: ["Aetna", "Cigna", "Oscar", "UnitedHealthcare", "Medicare"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English", "Spanish"],
        about: "Dr. Alex Rodriguez is a board-certified dermatologist specializing in medical, surgical, and cosmetic dermatology. With expertise in treating various skin conditions including acne, psoriasis, and skin cancer, Dr. Rodriguez is dedicated to providing personalized care for patients of all ages.",
        education: [
          { degree: "MD, Columbia University College of Physicians and Surgeons", institution: "Columbia University", graduationYear: "Graduated 2009" },
          { degree: "Dermatology Residency, NYU Langone Medical Center", institution: "NYU", graduationYear: "Completed 2013" }
        ],
        certifications: [
          { name: "Board Certified in Dermatology", organization: "American Board of Dermatology" },
          { name: "Fellow", organization: "American Academy of Dermatology" }
        ],
        officeAddress: { 
          street: "789 2nd Avenue, Suite 301", 
          city: "New York", 
          state: "NY", 
          zipCode: "10003",
          latitude: 40.7318,
          longitude: -73.9820
        },
        officePhone: "(212) 555-4567",
        officeHours: {
          "Monday": "8:30 AM - 5:00 PM",
          "Tuesday": "8:30 AM - 5:00 PM",
          "Wednesday": "8:30 AM - 5:00 PM",
          "Thursday": "8:30 AM - 5:00 PM",
          "Friday": "8:30 AM - 3:00 PM",
          "Saturday": "Closed",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: true
      },
      {
        name: "Dr. Jennifer Park",
        title: "MD",
        specialty: "Pediatrics",
        profileImage: "",
        facilityName: "Upper West Side Pediatrics",
        distance: 2.7,
        rating: 4.8,
        reviewCount: 156,
        nextAvailable: "Monday, 10:00 AM",
        insurances: ["Blue Cross Blue Shield", "UnitedHealthcare", "Aetna", "Cigna"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English", "Korean"],
        about: "Dr. Jennifer Park is a compassionate pediatrician with a focus on child development, preventive care, and managing common childhood conditions. She creates a comfortable environment for both children and parents, ensuring the best care for her young patients.",
        education: [
          { degree: "MD, Weill Cornell Medical College", institution: "Cornell University", graduationYear: "Graduated 2011" },
          { degree: "Pediatrics Residency, Children's Hospital of Philadelphia", institution: "UPenn", graduationYear: "Completed 2014" }
        ],
        certifications: [
          { name: "Board Certified in Pediatrics", organization: "American Board of Pediatrics" }
        ],
        officeAddress: { 
          street: "125 West 86th Street", 
          city: "New York", 
          state: "NY", 
          zipCode: "10024",
          latitude: 40.7867,
          longitude: -73.9754
        },
        officePhone: "(212) 555-8901",
        officeHours: {
          "Monday": "9:00 AM - 6:00 PM",
          "Tuesday": "9:00 AM - 6:00 PM",
          "Wednesday": "9:00 AM - 6:00 PM",
          "Thursday": "9:00 AM - 6:00 PM",
          "Friday": "9:00 AM - 5:00 PM",
          "Saturday": "9:00 AM - 12:00 PM",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. Robert Williams",
        title: "MD",
        specialty: "Orthopedics",
        profileImage: "",
        facilityName: "Manhattan Orthopedic Specialists",
        distance: 3.1,
        rating: 4.6,
        reviewCount: 189,
        nextAvailable: "Thursday, 2:00 PM",
        insurances: ["Medicare", "Blue Cross Blue Shield", "UnitedHealthcare", "Aetna"],
        isInNetwork: true,
        hasVirtualVisits: false,
        languages: ["English"],
        about: "Dr. Robert Williams is an orthopedic surgeon specializing in sports medicine, joint replacement, and arthroscopic surgery. He has extensive experience treating athletes of all levels and helping patients regain mobility after injury or degenerative conditions.",
        education: [
          { degree: "MD, Yale School of Medicine", institution: "Yale University", graduationYear: "Graduated 2006" },
          { degree: "Orthopedic Surgery Residency, Hospital for Special Surgery", institution: "HSS", graduationYear: "Completed 2011" },
          { degree: "Sports Medicine Fellowship, Andrews Institute", institution: "Andrews Institute", graduationYear: "Completed 2012" }
        ],
        certifications: [
          { name: "Board Certified in Orthopedic Surgery", organization: "American Board of Orthopedic Surgery" },
          { name: "Subspecialty Certification in Sports Medicine", organization: "American Board of Orthopedic Surgery" }
        ],
        officeAddress: { 
          street: "520 East 72nd Street, Suite 250", 
          city: "New York", 
          state: "NY", 
          zipCode: "10021",
          latitude: 40.7659,
          longitude: -73.9547
        },
        officePhone: "(212) 555-3456",
        officeHours: {
          "Monday": "8:00 AM - 5:00 PM",
          "Tuesday": "8:00 AM - 5:00 PM",
          "Wednesday": "8:00 AM - 5:00 PM",
          "Thursday": "8:00 AM - 5:00 PM",
          "Friday": "8:00 AM - 3:00 PM",
          "Saturday": "Closed",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      }
    ];

    seedData.forEach(provider => {
      this.createProvider(provider);
    });
  }
}

export const storage = new MemStorage();
