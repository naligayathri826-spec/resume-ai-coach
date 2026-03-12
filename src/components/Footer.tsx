import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ResumeAI</h3>
            <p className="text-sm opacity-90">
              AI-powered resume analysis, job matching, and career coaching — all in one platform.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">For Job Seekers</h4>
            <div className="space-y-2">
              <Link to="/upload" className="block text-sm opacity-90 hover:opacity-100 transition-opacity">
                Upload Resume
              </Link>
              <Link to="/jobs" className="block text-sm opacity-90 hover:opacity-100 transition-opacity">
                Job Board
              </Link>
              <Link to="/applications" className="block text-sm opacity-90 hover:opacity-100 transition-opacity">
                My Applications
              </Link>
              <Link to="/chatbot" className="block text-sm opacity-90 hover:opacity-100 transition-opacity">
                AI Career Coach
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">For Recruiters</h4>
            <div className="space-y-2">
              <Link to="/hiring/jobs" className="block text-sm opacity-90 hover:opacity-100 transition-opacity">
                My Jobs
              </Link>
              <Link to="/hiring/new" className="block text-sm opacity-90 hover:opacity-100 transition-opacity">
                Post a Job
              </Link>
              <Link to="/hiring/applications" className="block text-sm opacity-90 hover:opacity-100 transition-opacity">
                Review Applications
              </Link>
              <Link to="/pricing" className="block text-sm opacity-90 hover:opacity-100 transition-opacity">
                Pricing
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-6 text-center">
          <p className="text-sm opacity-90">
            © {new Date().getFullYear()} ResumeAI — Built with AI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
