import { BriefcaseMedical } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-borderColor mt-10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <BriefcaseMedical className="text-primary text-2xl mr-2" />
              <span className="text-lg font-semibold text-primary">Healthcare Provider Directory</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">Find the right healthcare provider for your needs</p>
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 hover:text-primary">About</a>
            <a href="#" className="text-gray-500 hover:text-primary">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-primary">Terms of Service</a>
            <a href="#" className="text-gray-500 hover:text-primary">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
