import { useState, KeyboardEvent } from "react";
import { BriefcaseMedical, Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Use search parameters directly via the URL for better compatibility
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        <Link href="/">
          <div className="flex items-center mb-4 md:mb-0 cursor-pointer">
            <BriefcaseMedical className="text-primary text-3xl mr-2" />
            <h1 className="text-2xl font-bold text-primary">Healthcare Provider Directory</h1>
          </div>
        </Link>
        <div className="w-full md:w-1/3">
          <div className="relative flex">
            <Input
              type="text"
              placeholder="Quick search by name, specialty..."
              className="pl-10 pr-4 py-2 rounded-r-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Button 
              className="rounded-l-none" 
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
