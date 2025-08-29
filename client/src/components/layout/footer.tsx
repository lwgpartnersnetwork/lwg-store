import { Link } from 'wouter';
import { Facebook, Twitter, Linkedin, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-foreground text-primary rounded-lg flex items-center justify-center">
                <span className="font-bold">LWG</span>
              </div>
              <span className="text-xl font-bold">LWG Partners</span>
            </div>
            <p className="text-primary-foreground/80 mb-4">
              Professional marketplace connecting businesses with premium solutions and services.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><Link href="#" className="hover:text-primary-foreground">About Us</Link></li>
              <li><Link href="/" className="hover:text-primary-foreground">Products</Link></li>
              <li><Link href="#" className="hover:text-primary-foreground">Services</Link></li>
              <li><Link href="#" className="hover:text-primary-foreground">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><Link href="#" className="hover:text-primary-foreground">Help Center</Link></li>
              <li><Link href="/track" className="hover:text-primary-foreground">Track Order</Link></li>
              <li><Link href="#" className="hover:text-primary-foreground">Returns</Link></li>
              <li><Link href="#" className="hover:text-primary-foreground">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3 text-primary-foreground/80">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+232 XX XXX XXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@lwgpartners.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Freetown, Sierra Leone</span>
              </div>
            </div>
          </div>
        </div>
        
        <hr className="border-primary-foreground/20 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-primary-foreground/80">
          <p>&copy; 2024 LWG Partners Network. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-primary-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary-foreground">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
