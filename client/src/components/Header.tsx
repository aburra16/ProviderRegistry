
import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      // Create a basic filter with just the search query
      const searchFilter = {
        searchQuery: searchQuery.trim(),
        page: 1,
        limit: 10,
        sort: "relevance"
      };
      
      // Navigate to the home page with search params
      navigate('/', { state: { searchFilter } });
      
      // Invalidate the providers query to trigger a refetch with the new search
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
    }
  }, [searchQuery, navigate, queryClient]);

  return (
    <header className="sticky top-0 z-10 w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="text-2xl">👨‍⚕️</span>
          FindCare
        </Link>
        
        <form onSubmit={handleSearch} className="w-full sm:max-w-md flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-2.5 top-2.5 text-gray-400">
              <Search size={18} />
            </div>
            <Input
              type="text"
              placeholder="Search for providers, specialties..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        
        <div className="hidden sm:flex gap-4">
          <Button variant="ghost">Sign In</Button>
          <Button>Sign Up</Button>
        </div>
      </div>
    </header>
  );
}
