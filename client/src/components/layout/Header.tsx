import { useState } from "react";
import { BriefcaseMedical } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

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
          <div className="relative">
            <Input
              type="text"
              placeholder="Quick search by name, specialty..."
              className="pl-10 pr-4 py-2 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
          </div>
        </div>
      </div>
    </header>
  );
}
