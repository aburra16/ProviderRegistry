import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import FilterSidebar, { FilterState } from "@/components/filters/FilterSidebar";
import ProviderCard from "@/components/providers/ProviderCard";
import Pagination from "@/components/common/Pagination";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Provider } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const location = useLocation();
  const searchFilterFromHeader = location.state?.searchFilter;
  
  const [activeTab, setActiveTab] = useState("results");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState | null>(
    searchFilterFromHeader ? { ...searchFilterFromHeader } : null
  );
  const [sortOption, setSortOption] = useState("relevance");
  
  // Create query key that includes filters and pagination
  const queryKey = filters 
    ? ['/api/providers', currentPage, sortOption, JSON.stringify(filters)]
    : ['/api/providers', currentPage, sortOption];
  
  // Fetch providers with filters if applied
  const { data, isLoading, isError } = useQuery<{
    providers: Provider[];
    total: number;
    location?: string;
  }>({
    queryKey,
    queryFn: async () => {
      if (filters) {
        // Use search endpoint for filters
        return apiRequest('POST', '/api/providers/filter', {
          ...filters,
          page: currentPage,
          sort: sortOption
        });
      } else {
        // Use regular providers endpoint
        return apiRequest('GET', `/api/providers?page=${currentPage}&limit=10&sort=${sortOption}`);
      }
    },
  });

  // Handle mobile tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Reset filters when navigating away and back
  useEffect(() => {
    if (searchFilterFromHeader) {
      setFilters(searchFilterFromHeader);
      setCurrentPage(1);
    }
  }, [searchFilterFromHeader]);

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Apply filters programmatically
  const applyFilters = async () => {
    if (!filters) return;
    
    try {
      await apiRequest('POST', '/api/providers/filter', filters);
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  // Calculate total pages
  const totalPages = data?.total ? Math.ceil(data.total / 10) : 1;

  // Check if we're on mobile to handle the responsive view
  const isMobile = window.innerWidth < 768;

  // Effect to handle window resize for mobile view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setActiveTab("results"); // Default to results on larger screens
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Mobile view tabs */}
      <div className="md:hidden mb-6 flex rounded-lg shadow-sm overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="search" className="flex-1 py-3">Search</TabsTrigger>
            <TabsTrigger value="results" className="flex-1 py-3">Results</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter sidebar - hidden on mobile when results tab is active */}
        <div className={`${activeTab === 'results' && isMobile ? 'hidden' : 'block'}`}>
          <FilterSidebar onFilterChange={handleFilterChange} />
        </div>

        {/* Results section - hidden on mobile when search tab is active */}
        <section className={`w-full md:w-3/4 lg:w-4/5 ${activeTab === 'search' && isMobile ? 'hidden' : 'block'}`}>
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {isLoading 
                    ? 'Loading providers...' 
                    : isError 
                      ? 'Error loading providers' 
                      : `${data?.total || 0} Healthcare Providers`
                  }
                </h2>
                {data?.location && <p className="text-gray-500">in {data.location}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Select 
                  value={sortOption}
                  onValueChange={(value) => {
                    setSortOption(value);
                    setCurrentPage(1); // Reset page when sort changes
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="availability">Availability</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Provider cards list */}
          <div className="space-y-4">
            {isLoading ? (
              // Loading state
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/5 flex flex-col items-center">
                      <div className="w-24 h-24 bg-gray-200 rounded-full mb-2"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="w-20 h-2 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <div className="w-1/2 h-5 bg-gray-200 rounded mb-2"></div>
                      <div className="w-1/3 h-4 bg-gray-200 rounded mb-3"></div>
                      <div className="w-2/3 h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="w-1/2 h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="flex gap-1">
                        <div className="w-16 h-6 bg-gray-200 rounded"></div>
                        <div className="w-16 h-6 bg-gray-200 rounded"></div>
                        <div className="w-16 h-6 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : isError ? (
              // Error state
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-accent">Error loading providers. Please try again.</p>
              </div>
            ) : data && data.providers.length > 0 ? (
              // Data loaded successfully
              data.providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))
            ) : (
              // No results
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p>No providers match your search criteria. Try adjusting your filters.</p>
              </div>
            )}

            {/* Pagination */}
            {data && data.total > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
