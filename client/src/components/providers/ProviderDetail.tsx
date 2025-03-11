import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarRating from "@/components/common/StarRating";
import { Provider } from "@shared/schema";
import { School, CheckCircle, Building2, Phone, Navigation2 } from "lucide-react";

interface ProviderDetailProps {
  provider: Provider;
}

export default function ProviderDetail({ provider }: ProviderDetailProps) {
  const [activeTab, setActiveTab] = useState("location");

  const {
    name,
    title,
    specialty,
    profileImage,
    rating,
    reviewCount,
    facilityName,
    nextAvailable,
    about,
    education,
    certifications,
    officeAddress,
    officePhone,
    officeHours,
    languages,
  } = provider;

  return (
    <div className="bg-white rounded-lg max-w-4xl w-full mx-auto">
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="w-40 h-40 rounded-full bg-gray-200 mb-4 overflow-hidden">
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
            <div className="flex items-center mb-2">
              <StarRating rating={rating} />
              <span className="ml-1 text-gray-600">{rating} ({reviewCount} reviews)</span>
            </div>
            <p className="text-center text-secondary font-medium mb-2">{specialty}</p>
            <div className="w-full mt-4">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold mb-3"
              >
                Book Appointment
              </Button>
              <div className="flex items-center justify-center text-gray-600 mb-2">
                <span className="material-icons text-sm mr-1">event_available</span>
                <span>Next available: {nextAvailable}</span>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-gray-700">{about}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Education & Credentials</h3>
              <ul className="space-y-2 text-gray-700">
                {education.map((edu, index) => (
                  <li key={index} className="flex items-start">
                    <School className="text-primary mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-sm text-gray-500">{edu.graduationYear}</p>
                    </div>
                  </li>
                ))}
                {certifications.map((cert, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="text-primary mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-gray-500">{cert.organization}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Tabs for detailed information */}
        <Tabs defaultValue="location" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="border-b border-borderColor mb-6 w-full justify-start">
            <TabsTrigger value="location">Location & Hours</TabsTrigger>
            <TabsTrigger value="insurance">Insurance & Payments</TabsTrigger>
            <TabsTrigger value="reviews">Patient Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="location">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Office Location</h3>
                <div className="bg-gray-100 rounded-lg h-64 mb-4 flex items-center justify-center"
                  id="map-container"
                >
                  {/* Map will be inserted here by Leaflet */}
                  <div className="text-center">
                    <span className="material-icons text-4xl text-gray-400">map</span>
                    <p className="text-gray-500">Map Loading...</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="font-medium">{facilityName}</p>
                  <p className="text-gray-700">{officeAddress.street}</p>
                  <p className="text-gray-700">{officeAddress.city}, {officeAddress.state} {officeAddress.zipCode}</p>
                  <p className="text-gray-700 mt-2">
                    <Phone className="h-4 w-4 inline mr-1" /> {officePhone}
                  </p>
                </div>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(officeAddress.street + ', ' + officeAddress.city + ', ' + officeAddress.state + ' ' + officeAddress.zipCode)}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-primary hover:underline flex items-center">
                  <Navigation2 className="h-4 w-4 mr-1" /> Get Directions
                </a>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Office Hours</h3>
                <table className="w-full text-gray-700">
                  <tbody>
                    {Object.entries(officeHours).map(([day, hours]) => (
                      <tr key={day} className="border-b border-borderColor">
                        <td className="py-2 font-medium">{day}</td>
                        <td className="py-2">{hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Languages Spoken</h4>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((language, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="insurance">
            <div>
              <h3 className="text-lg font-semibold mb-4">Accepted Insurance Plans</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {provider.insurances.map((insurance, index) => (
                  <div key={index} className="p-3 border border-borderColor rounded-md">
                    {insurance}
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                <p className="text-gray-700 mb-2">
                  Please contact the provider's office for up-to-date payment information and to verify accepted insurance plans before scheduling an appointment.
                </p>
                <p className="text-gray-700">
                  Co-pays and deductibles may apply based on your insurance plan.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews">
            <div>
              <h3 className="text-lg font-semibold mb-4">Patient Reviews</h3>
              <div className="flex items-center mb-6">
                <div className="text-4xl font-bold mr-4">{rating}</div>
                <div>
                  <StarRating rating={rating} size="lg" />
                  <p className="text-gray-500 mt-1">{reviewCount} reviews</p>
                </div>
              </div>
              
              <p className="text-gray-700">
                Patient reviews are available soon.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
