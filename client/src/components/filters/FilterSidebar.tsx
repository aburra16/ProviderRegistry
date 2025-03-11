import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface FilterSidebarProps {
  onFilterChange: (filters: FilterState) => void;
  switchToResultsTab?: () => void;
  className?: string;
}

export interface FilterState {
  specialty: string;
  zipCode: string;
  radius: string;
  insurance: string;
  availability: {
    today: boolean;
    thisWeek: boolean;
    weekends: boolean;
  };
  additional: {
    acceptingNewPatients: boolean;
    virtualVisits: boolean;
    spanishSpeaking: boolean;
  };
}

export default function FilterSidebar({ onFilterChange, switchToResultsTab, className }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>({
    specialty: "",
    zipCode: "",
    radius: "5",
    insurance: "",
    availability: {
      today: false,
      thisWeek: false,
      weekends: false,
    },
    additional: {
      acceptingNewPatients: false,
      virtualVisits: false,
      spanishSpeaking: false,
    },
  });

  // Fetch specialties
  const { data: specialties } = useQuery<string[]>({
    queryKey: ["/api/specialties"],
  });

  // Fetch insurance plans
  const { data: insurancePlans } = useQuery<string[]>({
    queryKey: ["/api/insurance-plans"],
  });

  // Apply filters
  const handleApplyFilters = () => {
    onFilterChange(filters);
    // Switch to results tab if the function is provided
    if (switchToResultsTab) {
      switchToResultsTab();
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    const resetFilters: FilterState = {
      specialty: "",
      zipCode: "",
      radius: "5",
      insurance: "",
      availability: {
        today: false,
        thisWeek: false,
        weekends: false,
      },
      additional: {
        acceptingNewPatients: false,
        virtualVisits: false,
        spanishSpeaking: false,
      },
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
    
    // Switch to results tab if the function is provided
    if (switchToResultsTab) {
      switchToResultsTab();
    }
  };

  // Update a single filter
  const updateFilter = (
    key: keyof FilterState,
    value: any
  ) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  // Update nested availability filter
  const updateAvailabilityFilter = (key: keyof typeof filters.availability, value: boolean) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      availability: {
        ...prevFilters.availability,
        [key]: value,
      },
    }));
  };

  // Update nested additional filter
  const updateAdditionalFilter = (key: keyof typeof filters.additional, value: boolean) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      additional: {
        ...prevFilters.additional,
        [key]: value,
      },
    }));
  };

  return (
    <aside className={`w-full md:w-1/4 lg:w-1/4 bg-white rounded-lg shadow-sm p-5 h-fit ${className}`}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button 
          className="text-primary text-sm font-semibold hover:underline"
          onClick={handleClearFilters}
        >
          Clear All
        </button>
      </div>

      {/* Filter: Specialty */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Specialty</h3>
        <div className="relative">
          <Select 
            value={filters.specialty}
            onValueChange={(value) => updateFilter("specialty", value)}
          >
            <SelectTrigger className="w-full border-gray-300">
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {Array.isArray(specialties) && specialties.length > 0 ? (
                specialties.map((specialty: string) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="primary-care">Primary Care</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="dermatology">Dermatology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="psychiatry">Psychiatry</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter: Location */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Location</h3>
        <div className="flex gap-2 mb-2">
          <Input
            type="text"
            placeholder="ZIP Code"
            value={filters.zipCode}
            onChange={(e) => updateFilter("zipCode", e.target.value)}
            className="flex-grow border-gray-300"
          />
          <Select 
            value={filters.radius}
            onValueChange={(value) => updateFilter("radius", value)}
          >
            <SelectTrigger className="w-28 border-gray-300">
              <SelectValue placeholder="5 miles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 miles</SelectItem>
              <SelectItem value="10">10 miles</SelectItem>
              <SelectItem value="25">25 miles</SelectItem>
              <SelectItem value="50">50 miles</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter: Insurance */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Insurance</h3>
        <div className="relative">
          <Select 
            value={filters.insurance}
            onValueChange={(value) => updateFilter("insurance", value)}
          >
            <SelectTrigger className="w-full border-gray-300">
              <SelectValue placeholder="Select Insurance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select Insurance</SelectItem>
              {Array.isArray(insurancePlans) && insurancePlans.length > 0 ? (
                insurancePlans.map((plan: string) => (
                  <SelectItem key={plan} value={plan}>
                    {plan}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="aetna">Aetna</SelectItem>
                  <SelectItem value="blueCross">Blue Cross Blue Shield</SelectItem>
                  <SelectItem value="cigna">Cigna</SelectItem>
                  <SelectItem value="humana">Humana</SelectItem>
                  <SelectItem value="medicaid">Medicaid</SelectItem>
                  <SelectItem value="medicare">Medicare</SelectItem>
                  <SelectItem value="unitedHealthcare">UnitedHealthcare</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter: Availability */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">Availability</h3>
        <div className="flex flex-wrap gap-3">
          <label className={`inline-flex items-center px-4 py-2 rounded-full text-sm border border-primary cursor-pointer transition-colors ${filters.availability.today ? 'bg-primary text-white' : 'hover:bg-primary/10'}`}>
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={filters.availability.today}
              onChange={(e) => updateAvailabilityFilter("today", e.target.checked)}
            />
            Today
          </label>
          <label className={`inline-flex items-center px-4 py-2 rounded-full text-sm border border-primary cursor-pointer transition-colors ${filters.availability.thisWeek ? 'bg-primary text-white' : 'hover:bg-primary/10'}`}>
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={filters.availability.thisWeek}
              onChange={(e) => updateAvailabilityFilter("thisWeek", e.target.checked)}
            />
            This Week
          </label>
          <label className={`inline-flex items-center px-4 py-2 rounded-full text-sm border border-primary cursor-pointer transition-colors ${filters.availability.weekends ? 'bg-primary text-white' : 'hover:bg-primary/10'}`}>
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={filters.availability.weekends}
              onChange={(e) => updateAvailabilityFilter("weekends", e.target.checked)}
            />
            Weekends
          </label>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="mb-8">
        <h3 className="font-semibold mb-3 text-gray-700">Additional Filters</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <Checkbox 
              checked={filters.additional.acceptingNewPatients}
              onCheckedChange={(checked) => 
                updateAdditionalFilter("acceptingNewPatients", checked === true)
              }
              className="mr-3 h-5 w-5"
            />
            <span>Accepting New Patients</span>
          </label>
          <label className="flex items-center">
            <Checkbox 
              checked={filters.additional.virtualVisits}
              onCheckedChange={(checked) => 
                updateAdditionalFilter("virtualVisits", checked === true)
              }
              className="mr-3 h-5 w-5"
            />
            <span>Virtual Visits</span>
          </label>
          <label className="flex items-center">
            <Checkbox 
              checked={filters.additional.spanishSpeaking}
              onCheckedChange={(checked) => 
                updateAdditionalFilter("spanishSpeaking", checked === true)
              }
              className="mr-3 h-5 w-5"
            />
            <span>Spanish Speaking</span>
          </label>
        </div>
      </div>

      <Button 
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 text-base"
        onClick={handleApplyFilters}
      >
        Apply Filters
      </Button>
    </aside>
  );
}
