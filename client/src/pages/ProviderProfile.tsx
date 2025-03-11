import { useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ProviderDetail from "@/components/providers/ProviderDetail";
import { Provider } from "@shared/schema";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ProviderProfile() {
  // Get provider ID from URL
  const [match, params] = useRoute("/providers/:id");
  const providerId = params?.id ? parseInt(params.id) : null;
  
  // Fetch provider details
  const { data: provider, isLoading, isError } = useQuery<Provider>({
    queryKey: providerId ? [`/api/providers/${providerId}`] : null,
    enabled: !!providerId,
  });

  // Initialize leaflet map if provider data is available
  useEffect(() => {
    if (provider && typeof window !== "undefined") {
      // Check if Leaflet is available
      const L = (window as any).L;
      if (L && provider.officeAddress) {
        // Load map
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
          // Clear previous map instance if it exists
          mapContainer.innerHTML = '';
          
          // Create map
          const map = L.map(mapContainer).setView([
            provider.officeAddress.latitude || 40.7128, 
            provider.officeAddress.longitude || -74.0060
          ], 14);
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          
          // Add marker
          L.marker([
            provider.officeAddress.latitude || 40.7128, 
            provider.officeAddress.longitude || -74.0060
          ]).addTo(map)
            .bindPopup(`<b>${provider.name}</b><br>${provider.facilityName}`);
        }
      }
    }
  }, [provider]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-10 bg-gray-200 rounded mx-auto mt-4"></div>
            </div>
            <div className="md:w-2/3">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="flex gap-2 mb-2">
                <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="flex gap-2 mb-2">
                <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-accent mb-4">Error loading provider information.</p>
          <Button asChild>
            <Link href="/">Return to Provider Directory</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="sticky top-0 bg-white z-10 border-b border-borderColor flex justify-between items-center p-4">
          <h2 className="text-xl font-semibold">{provider.name}, {provider.title}</h2>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <X className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        
        <ProviderDetail provider={provider} />
      </div>
    </div>
  );
}
