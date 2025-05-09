import { Logo } from "@/components/ui/logo";
import { Separator } from "@/components/ui/separator";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 mt-12 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <a 
              href="https://www.mycollegefinance.com/" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-90 transition-opacity"
            >
              <Logo size="sm" />
            </a>
            <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">
              © {new Date().getFullYear()} My College Finance, LLC. All rights reserved.
            </span>
          </div>
          
          <div className="flex space-x-6">
            <a 
              href="https://linktr.ee/mycollegefinance" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href="https://linktr.ee/mycollegefinance" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a 
              href="https://linktr.ee/mycollegefinance" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="https://linktr.ee/mycollegefinance" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <a 
            href="https://www.mycollegefinance.com/privacy-policy" 
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
          >
            Privacy Policy
          </a>
          <a 
            href="https://www.mycollegefinance.com/terms-policy" 
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
          >
            Terms of Service
          </a>
          <a 
            href="https://www.mycollegefinance.com/contact" 
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
          >
            Contact Us
          </a>
          <a 
            href="https://www.mycollegefinance.com/about" 
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
          >
            About Us
          </a>
          <a 
            href="https://www.mycollegefinance.com/knowledge-bank" 
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
          >
            Learn More
          </a>
        </div>
        
        <div className="flex justify-center mt-4">
          <p className="inline-flex items-center text-sm font-medium text-primary dark:text-primary-light">
            <span className="text-md">Educate • Motivate • Elevate</span>
          </p>
        </div>
        
        <div className="flex justify-end mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            50/30/20 Budget Calculator · v2.0.1 (Beta)
          </p>
        </div>
      </div>
    </footer>
  );
}
