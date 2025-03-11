import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/common/StarRating";
import { Provider } from "@shared/schema";

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const {
    id,
    name,
    title,
    specialty,
    profileImage,
    rating,
    reviewCount,
    distance,
    facilityName,
    nextAvailable,
    insurances,
    isInNetwork,
    hasVirtualVisits,
  } = provider;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 lg:w-1/5 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-borderColor">
          <div className="w-24 h-24 rounded-full bg-gray-200 mb-2 overflow-hidden">
            <svg
              className="h-full w-full text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="flex items-center mb-1">
            <StarRating rating={rating} />
            <span className="ml-1 text-gray-600 text-sm">{rating}</span>
          </div>
          <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
        </div>
        
        <div className="flex-grow p-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="text-lg font-semibold">{name}, {title}</h3>
              <p className="text-secondary font-medium mb-2">{specialty}</p>
              <div className="flex items-center text-gray-600 mb-2">
                <span className="material-icons text-sm mr-1">location_on</span>
                <span>{distance} miles - {facilityName}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-2">
                <span className="material-icons text-sm mr-1">event_available</span>
                <span>Next available: {nextAvailable}</span>
              </div>
            </div>

            <div className="mt-3 md:mt-0 md:ml-4 md:text-right">
              {isInNetwork && (
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mb-2">
                  In-Network
                </span>
              )}
              <div className="flex flex-col">
                <Button 
                  asChild
                  className="bg-primary hover:bg-primary/90 text-white font-semibold mb-2"
                >
                  <Link href={`/providers/${id}`}>View Profile</Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-primary text-primary font-semibold hover:bg-primary/10"
                >
                  Book Appointment
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {hasVirtualVisits && (
              <div className="flex items-center mb-2">
                <span className="material-icons text-secondary text-sm mr-1">verified</span>
                <span className="text-sm">Virtual visits available</span>
              </div>
            )}
            <h4 className="font-semibold text-sm mb-1">Accepted Insurance</h4>
            <div className="flex flex-wrap gap-1">
              {insurances.slice(0, 4).map((insurance, index) => (
                <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                  {insurance}
                </span>
              ))}
              {insurances.length > 4 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                  +{insurances.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
