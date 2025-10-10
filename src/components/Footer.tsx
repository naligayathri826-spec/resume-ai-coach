import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">AI Resume Analyzer</h3>
            <p className="text-sm opacity-90">
              Empowering job seekers with AI-powered resume analysis and smart job matching.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>+91 78936 21996</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4" />
                <span>satya7893621996@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>Vizag, Andhra Pradesh, India</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a href="/" className="block text-sm opacity-90 hover:opacity-100 transition-opacity">
                Home
              </a>
              <a href="/upload" className="block text-sm opacity-90 hover:opacity-100 transition-opacity">
                Upload Resume
              </a>
              <a href="/chatbot" className="block text-sm opacity-90 hover:opacity-100 transition-opacity">
                AI Chatbot
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-6 text-center">
          <p className="text-sm opacity-90">
            © 2025 AI-Powered Resume Analyzer | Designed with 💙 in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
