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
      "Ophthalmology", "Dentistry", "Physical Therapy", "Oncology",
      "Endocrinology", "Pulmonology", "Rheumatology", "Gastroenterology"
    ]);
    this.insurancePlans = new Set([
      "Aetna", "Blue Cross Blue Shield", "Cigna", "Humana", 
      "Medicaid", "Medicare", "UnitedHealthcare", "Oscar",
      "Kaiser Permanente", "Anthem", "Delta Dental", "Cigna Dental"
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
        (p.officeAddress && 
          (`${p.officeAddress.street}, ${p.officeAddress.city}, ${p.officeAddress.state} ${p.officeAddress.zipCode}`).toLowerCase().includes(query)
        ) ||
        p.about.toLowerCase().includes(query) ||
        (p.insurances && p.insurances.some(i => i.toLowerCase().includes(query)))
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
        p.insurances && p.insurances.some(i => i.toLowerCase() === filter.insurance?.toLowerCase())
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
          p.languages && p.languages.some(l => l.toLowerCase() === "spanish")
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
          "Saturday": "10:00 AM - 2:00 PM", 
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      // Additional providers
      {
        name: "Dr. Emily Wilson",
        title: "MD",
        specialty: "Neurology",
        profileImage: "",
        facilityName: "Brain & Spine Specialists",
        distance: 4.2,
        rating: 4.7,
        reviewCount: 119,
        nextAvailable: "Thursday, 11:15 AM",
        insurances: ["Blue Cross Blue Shield", "Cigna", "Medicare", "UnitedHealthcare"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English"],
        about: "Dr. Emily Wilson is a board-certified neurologist specializing in headache disorders, multiple sclerosis, and neurodegenerative diseases. Her approach combines the latest evidence-based treatments with personalized care plans for each patient.",
        education: [
          { degree: "MD, Yale School of Medicine", institution: "Yale University", graduationYear: "Graduated 2007" },
          { degree: "Neurology Residency, Massachusetts General Hospital", institution: "Harvard University", graduationYear: "Completed 2011" }
        ],
        certifications: [
          { name: "Board Certified in Neurology", organization: "American Board of Psychiatry and Neurology" }
        ],
        officeAddress: { 
          street: "550 Park Avenue, Suite 200", 
          city: "New York", 
          state: "NY", 
          zipCode: "10065",
          latitude: 40.7650,
          longitude: -73.9695
        },
        officePhone: "(212) 555-3456",
        officeHours: {
          "Monday": "8:30 AM - 5:30 PM",
          "Tuesday": "8:30 AM - 5:30 PM",
          "Wednesday": "8:30 AM - 5:30 PM",
          "Thursday": "8:30 AM - 5:30 PM",
          "Friday": "8:30 AM - 4:00 PM",
          "Saturday": "Closed",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. Robert Thompson",
        title: "MD",
        specialty: "Orthopedics",
        profileImage: "",
        facilityName: "Manhattan Orthopedic Associates",
        distance: 1.5,
        rating: 4.6,
        reviewCount: 207,
        nextAvailable: "Today, 4:00 PM",
        insurances: ["Aetna", "Blue Cross Blue Shield", "Oscar", "UnitedHealthcare"],
        isInNetwork: true,
        hasVirtualVisits: false,
        languages: ["English"],
        about: "Dr. Robert Thompson is a board-certified orthopedic surgeon specializing in sports medicine and joint replacement. With over 15 years of experience, he has helped countless patients regain mobility and improve their quality of life.",
        education: [
          { degree: "MD, University of Pennsylvania School of Medicine", institution: "UPenn", graduationYear: "Graduated 2005" },
          { degree: "Orthopedic Surgery Residency, Hospital for Special Surgery", institution: "HSS", graduationYear: "Completed 2010" }
        ],
        certifications: [
          { name: "Board Certified in Orthopedic Surgery", organization: "American Board of Orthopedic Surgery" },
          { name: "Fellowship in Sports Medicine", organization: "Andrews Sports Medicine & Orthopedic Center" }
        ],
        officeAddress: { 
          street: "215 East 68th Street, Suite 150", 
          city: "New York", 
          state: "NY", 
          zipCode: "10065",
          latitude: 40.7671,
          longitude: -73.9598
        },
        officePhone: "(212) 555-6789",
        officeHours: {
          "Monday": "8:00 AM - 6:00 PM",
          "Tuesday": "8:00 AM - 6:00 PM",
          "Wednesday": "8:00 AM - 6:00 PM",
          "Thursday": "8:00 AM - 6:00 PM",
          "Friday": "8:00 AM - 5:00 PM",
          "Saturday": "9:00 AM - 1:00 PM",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. Maria Gonzalez",
        title: "MD",
        specialty: "Psychiatry",
        profileImage: "",
        facilityName: "Wellness Mental Health Center",
        distance: 3.1,
        rating: 4.9,
        reviewCount: 98,
        nextAvailable: "Wednesday, 2:45 PM",
        insurances: ["Aetna", "Cigna", "UnitedHealthcare", "Oscar"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English", "Spanish"],
        about: "Dr. Maria Gonzalez is a compassionate psychiatrist specializing in mood disorders, anxiety, and trauma. She takes a holistic approach to mental health, integrating medication management with psychotherapy and lifestyle changes to support overall wellbeing.",
        education: [
          { degree: "MD, Albert Einstein College of Medicine", institution: "Yeshiva University", graduationYear: "Graduated 2012" },
          { degree: "Psychiatry Residency, NYU Langone Medical Center", institution: "NYU", graduationYear: "Completed 2016" }
        ],
        certifications: [
          { name: "Board Certified in Psychiatry", organization: "American Board of Psychiatry and Neurology" }
        ],
        officeAddress: { 
          street: "120 West 45th Street, Suite 1802", 
          city: "New York", 
          state: "NY", 
          zipCode: "10036",
          latitude: 40.7572,
          longitude: -73.9840
        },
        officePhone: "(212) 555-5678",
        officeHours: {
          "Monday": "9:00 AM - 7:00 PM",
          "Tuesday": "9:00 AM - 7:00 PM",
          "Wednesday": "9:00 AM - 7:00 PM",
          "Thursday": "9:00 AM - 7:00 PM",
          "Friday": "9:00 AM - 5:00 PM",
          "Saturday": "Closed",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: true
      },
      {
        name: "Dr. David Kim",
        title: "MD",
        specialty: "Ophthalmology",
        profileImage: "",
        facilityName: "Vision Care Center",
        distance: 2.0,
        rating: 4.8,
        reviewCount: 175,
        nextAvailable: "Friday, 9:30 AM",
        insurances: ["Blue Cross Blue Shield", "UnitedHealthcare", "Aetna", "Humana"],
        isInNetwork: true,
        hasVirtualVisits: false,
        languages: ["English", "Korean"],
        about: "Dr. David Kim is a skilled ophthalmologist specializing in cataract surgery, glaucoma management, and comprehensive eye care. He is committed to using the latest technologies to preserve and enhance his patients' vision.",
        education: [
          { degree: "MD, Duke University School of Medicine", institution: "Duke University", graduationYear: "Graduated 2009" },
          { degree: "Ophthalmology Residency, Bascom Palmer Eye Institute", institution: "University of Miami", graduationYear: "Completed 2013" }
        ],
        certifications: [
          { name: "Board Certified in Ophthalmology", organization: "American Board of Ophthalmology" }
        ],
        officeAddress: { 
          street: "325 East 34th Street", 
          city: "New York", 
          state: "NY", 
          zipCode: "10016",
          latitude: 40.7451,
          longitude: -73.9759
        },
        officePhone: "(212) 555-9012",
        officeHours: {
          "Monday": "8:30 AM - 5:30 PM",
          "Tuesday": "8:30 AM - 5:30 PM",
          "Wednesday": "8:30 AM - 5:30 PM",
          "Thursday": "8:30 AM - 5:30 PM",
          "Friday": "8:30 AM - 3:00 PM",
          "Saturday": "9:00 AM - 1:00 PM",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. Rachel Green",
        title: "MD",
        specialty: "Gynecology",
        profileImage: "",
        facilityName: "Women's Health Center",
        distance: 2.9,
        rating: 4.7,
        reviewCount: 182,
        nextAvailable: "Monday, 1:30 PM",
        insurances: ["Aetna", "Cigna", "Blue Cross Blue Shield", "UnitedHealthcare"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English"],
        about: "Dr. Rachel Green is a board-certified gynecologist specializing in women's health, minimally invasive surgery, and reproductive health. She provides comprehensive care in a supportive environment, addressing each patient's unique needs.",
        education: [
          { degree: "MD, Harvard Medical School", institution: "Harvard University", graduationYear: "Graduated 2010" },
          { degree: "OB/GYN Residency, Massachusetts General Hospital", institution: "Harvard University", graduationYear: "Completed 2014" }
        ],
        certifications: [
          { name: "Board Certified in Obstetrics and Gynecology", organization: "American Board of Obstetrics and Gynecology" }
        ],
        officeAddress: { 
          street: "425 West 59th Street, Suite 5A", 
          city: "New York", 
          state: "NY", 
          zipCode: "10019",
          latitude: 40.7707,
          longitude: -73.9877
        },
        officePhone: "(212) 555-3456",
        officeHours: {
          "Monday": "9:00 AM - 6:00 PM",
          "Tuesday": "9:00 AM - 6:00 PM",
          "Wednesday": "9:00 AM - 6:00 PM",
          "Thursday": "9:00 AM - 6:00 PM",
          "Friday": "9:00 AM - 4:00 PM",
          "Saturday": "Closed",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. William Taylor",
        title: "DDS",
        specialty: "Dentistry",
        profileImage: "",
        facilityName: "Manhattan Dental Associates",
        distance: 1.7,
        rating: 4.6,
        reviewCount: 203,
        nextAvailable: "Today, 3:15 PM",
        insurances: ["Delta Dental", "Cigna Dental", "Aetna", "UnitedHealthcare"],
        isInNetwork: true,
        hasVirtualVisits: false,
        languages: ["English"],
        about: "Dr. William Taylor is a skilled dentist offering comprehensive dental care from routine cleanings to cosmetic procedures. With a gentle touch and attention to detail, he ensures every patient has a comfortable experience and leaves with a healthier smile.",
        education: [
          { degree: "DDS, Columbia University College of Dental Medicine", institution: "Columbia University", graduationYear: "Graduated 2008" }
        ],
        certifications: [
          { name: "Member", organization: "American Dental Association" }
        ],
        officeAddress: { 
          street: "150 East 58th Street, Suite 3200", 
          city: "New York", 
          state: "NY", 
          zipCode: "10022",
          latitude: 40.7608,
          longitude: -73.9675
        },
        officePhone: "(212) 555-7890",
        officeHours: {
          "Monday": "8:00 AM - 6:00 PM",
          "Tuesday": "8:00 AM - 6:00 PM",
          "Wednesday": "8:00 AM - 6:00 PM",
          "Thursday": "8:00 AM - 6:00 PM",
          "Friday": "8:00 AM - 4:00 PM",
          "Saturday": "9:00 AM - 2:00 PM",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. Thomas Lee",
        title: "MD",
        specialty: "Cardiology",
        profileImage: "",
        facilityName: "Heart Health Institute",
        distance: 3.2,
        rating: 4.5,
        reviewCount: 165,
        nextAvailable: "Thursday, 10:00 AM",
        insurances: ["Blue Cross Blue Shield", "Medicare", "Aetna", "Cigna"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English", "Chinese"],
        about: "Dr. Thomas Lee is a cardiologist specializing in preventive cardiology and cardiac imaging. His approach emphasizes early detection and lifestyle modifications to manage and prevent heart disease.",
        education: [
          { degree: "MD, University of Michigan Medical School", institution: "University of Michigan", graduationYear: "Graduated 2006" },
          { degree: "Cardiology Fellowship, Cleveland Clinic", institution: "Cleveland Clinic", graduationYear: "Completed 2012" }
        ],
        certifications: [
          { name: "Board Certified in Cardiovascular Disease", organization: "American Board of Internal Medicine" }
        ],
        officeAddress: { 
          street: "240 East 64th Street", 
          city: "New York", 
          state: "NY", 
          zipCode: "10065",
          latitude: 40.7648,
          longitude: -73.9625
        },
        officePhone: "(212) 555-2345",
        officeHours: {
          "Monday": "8:30 AM - 5:30 PM",
          "Tuesday": "8:30 AM - 5:30 PM",
          "Wednesday": "8:30 AM - 5:30 PM",
          "Thursday": "8:30 AM - 5:30 PM",
          "Friday": "8:30 AM - 4:00 PM",
          "Saturday": "Closed",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. Sophia Martinez",
        title: "MD",
        specialty: "Dermatology",
        profileImage: "",
        facilityName: "SoHo Dermatology",
        distance: 2.5,
        rating: 4.8,
        reviewCount: 220,
        nextAvailable: "Tuesday, 1:45 PM",
        insurances: ["Aetna", "Blue Cross Blue Shield", "Cigna", "Oscar"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English", "Spanish"],
        about: "Dr. Sophia Martinez is a board-certified dermatologist specializing in medical and cosmetic dermatology. From acne and eczema to anti-aging treatments, she is committed to helping patients achieve healthy, beautiful skin.",
        education: [
          { degree: "MD, Harvard Medical School", institution: "Harvard University", graduationYear: "Graduated 2011" },
          { degree: "Dermatology Residency, Massachusetts General Hospital", institution: "Harvard University", graduationYear: "Completed 2015" }
        ],
        certifications: [
          { name: "Board Certified in Dermatology", organization: "American Board of Dermatology" }
        ],
        officeAddress: { 
          street: "155 Spring Street", 
          city: "New York", 
          state: "NY", 
          zipCode: "10012",
          latitude: 40.7255,
          longitude: -73.9990
        },
        officePhone: "(212) 555-9090",
        officeHours: {
          "Monday": "9:00 AM - 6:00 PM",
          "Tuesday": "9:00 AM - 6:00 PM",
          "Wednesday": "9:00 AM - 6:00 PM",
          "Thursday": "9:00 AM - 6:00 PM",
          "Friday": "9:00 AM - 5:00 PM",
          "Saturday": "10:00 AM - 2:00 PM",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: true
      },
      {
        name: "Dr. James Wilson",
        title: "MD",
        specialty: "Orthopedics",
        profileImage: "",
        facilityName: "Sports Medicine & Orthopedic Care",
        distance: 4.0,
        rating: 4.7,
        reviewCount: 189,
        nextAvailable: "Monday, 3:30 PM",
        insurances: ["Blue Cross Blue Shield", "Aetna", "Cigna", "UnitedHealthcare"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English"],
        about: "Dr. James Wilson is an orthopedic surgeon specializing in sports injuries and joint replacement. As a former athlete himself, he understands the importance of restoring function and getting patients back to their active lifestyles.",
        education: [
          { degree: "MD, Vanderbilt University School of Medicine", institution: "Vanderbilt University", graduationYear: "Graduated 2007" },
          { degree: "Orthopedic Surgery Residency, Hospital for Special Surgery", institution: "HSS", graduationYear: "Completed 2012" }
        ],
        certifications: [
          { name: "Board Certified in Orthopedic Surgery", organization: "American Board of Orthopedic Surgery" },
          { name: "Fellowship in Sports Medicine", organization: "Andrews Sports Medicine & Orthopedic Center" }
        ],
        officeAddress: { 
          street: "515 Madison Avenue, 5th Floor", 
          city: "New York", 
          state: "NY", 
          zipCode: "10022",
          latitude: 40.7609,
          longitude: -73.9744
        },
        officePhone: "(212) 555-8765",
        officeHours: {
          "Monday": "8:00 AM - 6:00 PM",
          "Tuesday": "8:00 AM - 6:00 PM",
          "Wednesday": "8:00 AM - 6:00 PM",
          "Thursday": "8:00 AM - 6:00 PM",
          "Friday": "8:00 AM - 5:00 PM",
          "Saturday": "9:00 AM - 1:00 PM",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. Elizabeth Rodriguez",
        title: "MD",
        specialty: "Primary Care",
        profileImage: "",
        facilityName: "North Manhattan Family Medicine",
        distance: 4.8,
        rating: 4.9,
        reviewCount: 178,
        nextAvailable: "Today, 5:15 PM",
        insurances: ["Medicare", "Medicaid", "Blue Cross Blue Shield", "UnitedHealthcare", "Cigna"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English", "Spanish"],
        about: "Dr. Elizabeth Rodriguez is a family medicine physician who provides comprehensive care for patients of all ages. With a focus on preventive health and chronic disease management, she builds long-term relationships with her patients to support their health goals.",
        education: [
          { degree: "MD, NYU School of Medicine", institution: "New York University", graduationYear: "Graduated 2010" },
          { degree: "Family Medicine Residency, Columbia University Medical Center", institution: "Columbia University", graduationYear: "Completed 2013" }
        ],
        certifications: [
          { name: "Board Certified in Family Medicine", organization: "American Board of Family Medicine" }
        ],
        officeAddress: { 
          street: "570 West 168th Street", 
          city: "New York", 
          state: "NY", 
          zipCode: "10032",
          latitude: 40.8404,
          longitude: -73.9430
        },
        officePhone: "(212) 555-6543",
        officeHours: {
          "Monday": "9:00 AM - 7:00 PM",
          "Tuesday": "9:00 AM - 7:00 PM",
          "Wednesday": "9:00 AM - 7:00 PM",
          "Thursday": "9:00 AM - 7:00 PM",
          "Friday": "9:00 AM - 5:00 PM",
          "Saturday": "10:00 AM - 3:00 PM",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: true
      },
      {
        name: "Dr. Andrew Phillips",
        title: "MD",
        specialty: "Neurology",
        profileImage: "",
        facilityName: "Central Park Neurology",
        distance: 1.9,
        rating: 4.6,
        reviewCount: 142,
        nextAvailable: "Wednesday, 9:00 AM",
        insurances: ["Aetna", "Blue Cross Blue Shield", "Cigna", "UnitedHealthcare"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English"],
        about: "Dr. Andrew Phillips is a neurologist specializing in stroke, epilepsy, and movement disorders. He combines traditional neurological care with the latest research to offer his patients the most effective treatments available.",
        education: [
          { degree: "MD, Washington University School of Medicine", institution: "Washington University", graduationYear: "Graduated 2008" },
          { degree: "Neurology Residency, New York-Presbyterian Hospital", institution: "Columbia University", graduationYear: "Completed 2012" }
        ],
        certifications: [
          { name: "Board Certified in Neurology", organization: "American Board of Psychiatry and Neurology" }
        ],
        officeAddress: { 
          street: "12 West 72nd Street, Suite 1A", 
          city: "New York", 
          state: "NY", 
          zipCode: "10023",
          latitude: 40.7765,
          longitude: -73.9761
        },
        officePhone: "(212) 555-3210",
        officeHours: {
          "Monday": "8:30 AM - 5:30 PM",
          "Tuesday": "8:30 AM - 5:30 PM",
          "Wednesday": "8:30 AM - 5:30 PM",
          "Thursday": "8:30 AM - 5:30 PM",
          "Friday": "8:30 AM - 3:00 PM",
          "Saturday": "Closed",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. Amanda Patel",
        title: "MD",
        specialty: "Endocrinology",
        profileImage: "",
        facilityName: "Endocrine & Diabetes Center",
        distance: 3.6,
        rating: 4.8,
        reviewCount: 126,
        nextAvailable: "Next Tuesday, 11:30 AM",
        insurances: ["Aetna", "Cigna", "Blue Cross Blue Shield", "UnitedHealthcare"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English", "Hindi"],
        about: "Dr. Amanda Patel is an endocrinologist specializing in diabetes management, thyroid disorders, and metabolic conditions. She takes a holistic approach, considering lifestyle factors alongside medical interventions to help patients effectively manage their conditions.",
        education: [
          { degree: "MD, Stanford University School of Medicine", institution: "Stanford University", graduationYear: "Graduated 2009" },
          { degree: "Endocrinology Fellowship, Mayo Clinic", institution: "Mayo Clinic", graduationYear: "Completed 2014" }
        ],
        certifications: [
          { name: "Board Certified in Endocrinology", organization: "American Board of Internal Medicine" }
        ],
        officeAddress: { 
          street: "333 East 38th Street, 6th Floor", 
          city: "New York", 
          state: "NY", 
          zipCode: "10016",
          latitude: 40.7469,
          longitude: -73.9739
        },
        officePhone: "(212) 555-9876",
        officeHours: {
          "Monday": "9:00 AM - 5:00 PM",
          "Tuesday": "9:00 AM - 5:00 PM",
          "Wednesday": "9:00 AM - 5:00 PM",
          "Thursday": "9:00 AM - 5:00 PM",
          "Friday": "9:00 AM - 4:00 PM",
          "Saturday": "Closed",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. Carlos Hernandez",
        title: "MD",
        specialty: "Pulmonology",
        profileImage: "",
        facilityName: "Respiratory & Sleep Medicine",
        distance: 3.0,
        rating: 4.7,
        reviewCount: 135,
        nextAvailable: "Thursday, 2:00 PM",
        insurances: ["Medicare", "Blue Cross Blue Shield", "Aetna", "UnitedHealthcare"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English", "Spanish"],
        about: "Dr. Carlos Hernandez is a pulmonologist specializing in asthma, COPD, sleep disorders, and respiratory infections. He combines his extensive clinical expertise with compassionate care to help patients breathe easier and improve their quality of life.",
        education: [
          { degree: "MD, University of California, Los Angeles", institution: "UCLA", graduationYear: "Graduated 2007" },
          { degree: "Pulmonary Fellowship, Memorial Sloan Kettering", institution: "MSK", graduationYear: "Completed 2012" }
        ],
        certifications: [
          { name: "Board Certified in Pulmonary Disease", organization: "American Board of Internal Medicine" },
          { name: "Board Certified in Sleep Medicine", organization: "American Board of Sleep Medicine" }
        ],
        officeAddress: { 
          street: "275 Seventh Avenue, 12th Floor", 
          city: "New York", 
          state: "NY", 
          zipCode: "10001",
          latitude: 40.7465,
          longitude: -73.9936
        },
        officePhone: "(212) 555-6789",
        officeHours: {
          "Monday": "8:00 AM - 6:00 PM",
          "Tuesday": "8:00 AM - 6:00 PM",
          "Wednesday": "8:00 AM - 6:00 PM",
          "Thursday": "8:00 AM - 6:00 PM",
          "Friday": "8:00 AM - 4:00 PM",
          "Saturday": "Closed",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: true
      },
      {
        name: "Dr. Olivia Washington",
        title: "MD",
        specialty: "Psychiatry",
        profileImage: "",
        facilityName: "Riverside Mental Health",
        distance: 2.3,
        rating: 5.0,
        reviewCount: 112,
        nextAvailable: "Friday, 4:30 PM",
        insurances: ["Aetna", "Cigna", "Oscar", "UnitedHealthcare"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English"],
        about: "Dr. Olivia Washington is a psychiatrist specializing in depression, anxiety disorders, and PTSD. She takes a patient-centered approach, incorporating medication management, psychotherapy, and lifestyle interventions to treat the whole person.",
        education: [
          { degree: "MD, Columbia University College of Physicians and Surgeons", institution: "Columbia University", graduationYear: "Graduated 2011" },
          { degree: "Psychiatry Residency, Columbia University Medical Center", institution: "Columbia University", graduationYear: "Completed 2015" }
        ],
        certifications: [
          { name: "Board Certified in Psychiatry", organization: "American Board of Psychiatry and Neurology" }
        ],
        officeAddress: { 
          street: "160 West 86th Street", 
          city: "New York", 
          state: "NY", 
          zipCode: "10024",
          latitude: 40.7865,
          longitude: -73.9770
        },
        officePhone: "(212) 555-3456",
        officeHours: {
          "Monday": "9:00 AM - 7:00 PM",
          "Tuesday": "9:00 AM - 7:00 PM",
          "Wednesday": "9:00 AM - 7:00 PM",
          "Thursday": "9:00 AM - 7:00 PM",
          "Friday": "9:00 AM - 5:00 PM",
          "Saturday": "Closed",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. Samuel Jordan",
        title: "MD",
        specialty: "Oncology",
        profileImage: "",
        facilityName: "Cancer Treatment Center of New York",
        distance: 3.8,
        rating: 4.9,
        reviewCount: 147,
        nextAvailable: "Monday, 11:00 AM",
        insurances: ["Medicare", "Blue Cross Blue Shield", "Aetna", "UnitedHealthcare"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English"],
        about: "Dr. Samuel Jordan is a medical oncologist specializing in breast cancer, lung cancer, and gastrointestinal malignancies. He is committed to providing the most advanced, personalized cancer care while supporting patients and their families throughout their treatment journey.",
        education: [
          { degree: "MD, University of Chicago Pritzker School of Medicine", institution: "University of Chicago", graduationYear: "Graduated 2006" },
          { degree: "Oncology Fellowship, Memorial Sloan Kettering", institution: "MSK", graduationYear: "Completed 2012" }
        ],
        certifications: [
          { name: "Board Certified in Medical Oncology", organization: "American Board of Internal Medicine" },
          { name: "Board Certified in Hematology", organization: "American Board of Internal Medicine" }
        ],
        officeAddress: { 
          street: "530 East 71st Street", 
          city: "New York", 
          state: "NY", 
          zipCode: "10021",
          latitude: 40.7664,
          longitude: -73.9547
        },
        officePhone: "(212) 555-8901",
        officeHours: {
          "Monday": "8:00 AM - 5:30 PM",
          "Tuesday": "8:00 AM - 5:30 PM",
          "Wednesday": "8:00 AM - 5:30 PM",
          "Thursday": "8:00 AM - 5:30 PM",
          "Friday": "8:00 AM - 4:00 PM",
          "Saturday": "Closed",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. Lisa Chang",
        title: "MD",
        specialty: "Rheumatology",
        profileImage: "",
        facilityName: "Arthritis & Rheumatology Center",
        distance: 2.6,
        rating: 4.8,
        reviewCount: 132,
        nextAvailable: "Next Wednesday, 10:15 AM",
        insurances: ["Aetna", "Blue Cross Blue Shield", "Cigna", "Medicare"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English", "Mandarin"],
        about: "Dr. Lisa Chang is a rheumatologist specializing in autoimmune diseases, inflammatory arthritis, and osteoporosis. She works closely with her patients to develop comprehensive treatment plans that address their symptoms and improve their quality of life.",
        education: [
          { degree: "MD, University of Pennsylvania School of Medicine", institution: "UPenn", graduationYear: "Graduated 2010" },
          { degree: "Rheumatology Fellowship, Hospital for Special Surgery", institution: "HSS", graduationYear: "Completed 2015" }
        ],
        certifications: [
          { name: "Board Certified in Rheumatology", organization: "American Board of Internal Medicine" }
        ],
        officeAddress: { 
          street: "535 East 70th Street", 
          city: "New York", 
          state: "NY", 
          zipCode: "10021",
          latitude: 40.7658,
          longitude: -73.9551
        },
        officePhone: "(212) 555-4321",
        officeHours: {
          "Monday": "8:30 AM - 5:30 PM",
          "Tuesday": "8:30 AM - 5:30 PM",
          "Wednesday": "8:30 AM - 5:30 PM",
          "Thursday": "8:30 AM - 5:30 PM",
          "Friday": "8:30 AM - 3:00 PM",
          "Saturday": "Closed",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. Richard Brown",
        title: "MD",
        specialty: "Gastroenterology",
        profileImage: "",
        facilityName: "Manhattan Digestive Health",
        distance: 1.6,
        rating: 4.6,
        reviewCount: 183,
        nextAvailable: "Today, 12:45 PM",
        insurances: ["Aetna", "Cigna", "UnitedHealthcare", "Blue Cross Blue Shield"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English"],
        about: "Dr. Richard Brown is a gastroenterologist specializing in digestive disorders, inflammatory bowel disease, and colorectal cancer screening. He is known for his thorough evaluations and clear explanations that help patients understand their conditions and treatment options.",
        education: [
          { degree: "MD, Weill Cornell Medical College", institution: "Cornell University", graduationYear: "Graduated 2008" },
          { degree: "Gastroenterology Fellowship, Mount Sinai Hospital", institution: "Mount Sinai", graduationYear: "Completed 2014" }
        ],
        certifications: [
          { name: "Board Certified in Gastroenterology", organization: "American Board of Internal Medicine" }
        ],
        officeAddress: { 
          street: "110 East 59th Street, Suite 10B", 
          city: "New York", 
          state: "NY", 
          zipCode: "10022",
          latitude: 40.7618,
          longitude: -73.9699
        },
        officePhone: "(212) 555-7654",
        officeHours: {
          "Monday": "8:00 AM - 6:00 PM",
          "Tuesday": "8:00 AM - 6:00 PM",
          "Wednesday": "8:00 AM - 6:00 PM",
          "Thursday": "8:00 AM - 6:00 PM",
          "Friday": "8:00 AM - 4:00 PM",
          "Saturday": "9:00 AM - 12:00 PM",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. Katherine Miller",
        title: "MD",
        specialty: "Pediatrics",
        profileImage: "",
        facilityName: "Downtown Children's Health",
        distance: 2.8,
        rating: 4.9,
        reviewCount: 205,
        nextAvailable: "Tomorrow, 3:30 PM",
        insurances: ["Aetna", "Blue Cross Blue Shield", "Cigna", "UnitedHealthcare"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English"],
        about: "Dr. Katherine Miller is a board-certified pediatrician dedicated to providing comprehensive care for children from infancy through adolescence. Her practice emphasizes preventive care, development monitoring, and creating a supportive environment where both children and parents feel comfortable.",
        education: [
          { degree: "MD, Baylor College of Medicine", institution: "Baylor", graduationYear: "Graduated 2009" },
          { degree: "Pediatrics Residency, Morgan Stanley Children's Hospital", institution: "Columbia University", graduationYear: "Completed 2012" }
        ],
        certifications: [
          { name: "Board Certified in Pediatrics", organization: "American Board of Pediatrics" }
        ],
        officeAddress: { 
          street: "80 West Broadway", 
          city: "New York", 
          state: "NY", 
          zipCode: "10007",
          latitude: 40.7146,
          longitude: -74.0088
        },
        officePhone: "(212) 555-9876",
        officeHours: {
          "Monday": "9:00 AM - 6:00 PM",
          "Tuesday": "9:00 AM - 6:00 PM",
          "Wednesday": "9:00 AM - 6:00 PM",
          "Thursday": "9:00 AM - 6:00 PM",
          "Friday": "9:00 AM - 5:00 PM",
          "Saturday": "9:00 AM - 1:00 PM",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: false
      },
      {
        name: "Dr. Robert Garcia",
        title: "MD",
        specialty: "Dermatology",
        profileImage: "",
        facilityName: "Manhattan Skin & Laser",
        distance: 1.8,
        rating: 4.7,
        reviewCount: 196,
        nextAvailable: "Tuesday, 10:00 AM",
        insurances: ["Aetna", "Blue Cross Blue Shield", "Cigna", "UnitedHealthcare"],
        isInNetwork: true,
        hasVirtualVisits: true,
        languages: ["English", "Spanish"],
        about: "Dr. Robert Garcia is a board-certified dermatologist specializing in skin cancer detection, acne treatment, and cosmetic procedures. He takes a patient-centered approach, ensuring each person receives personalized care for their unique skin concerns.",
        education: [
          { degree: "MD, Albert Einstein College of Medicine", institution: "Yeshiva University", graduationYear: "Graduated 2008" },
          { degree: "Dermatology Residency, New York University", institution: "NYU", graduationYear: "Completed 2012" }
        ],
        certifications: [
          { name: "Board Certified in Dermatology", organization: "American Board of Dermatology" }
        ],
        officeAddress: { 
          street: "315 Madison Avenue, Suite 901", 
          city: "New York", 
          state: "NY", 
          zipCode: "10017",
          latitude: 40.7529,
          longitude: -73.9804
        },
        officePhone: "(212) 555-1122",
        officeHours: {
          "Monday": "8:30 AM - 5:30 PM",
          "Tuesday": "8:30 AM - 5:30 PM",
          "Wednesday": "8:30 AM - 5:30 PM",
          "Thursday": "8:30 AM - 5:30 PM",
          "Friday": "8:30 AM - 4:00 PM",
          "Saturday": "9:00 AM - 1:00 PM",
          "Sunday": "Closed"
        },
        acceptingNewPatients: true,
        isSpanishSpeaking: true
      }
    ];
    
    seedData.forEach(provider => {
      this.createProvider(provider);
    });
  }
}

export const storage = new MemStorage();