import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Linkedin, Twitter, Facebook, Link, Mail, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  score: number;
  category: string;
  title?: string;
}

export function SocialShare({ score, category, title = "Resume Analysis" }: SocialShareProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareText = `🎯 Just scored ${score}% on my resume analysis in ${category}! Using AI-powered resume analysis to optimize my job search. Check it out!`;
  const shareUrl = window.location.href;

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(shareText)}`;
    window.open(linkedInUrl, "_blank", "width=600,height=400");
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  const shareByEmail = () => {
    const subject = `My Resume Analysis Score: ${score}%`;
    const body = `${shareText}\n\nView my results: ${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Share your results with anyone",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="shadow-soft">
          <Share2 className="mr-2 h-4 w-4" />
          Share Results
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={shareToLinkedIn} className="cursor-pointer">
          <Linkedin className="mr-2 h-4 w-4 text-[#0077b5]" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter} className="cursor-pointer">
          <Twitter className="mr-2 h-4 w-4 text-[#1da1f2]" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook} className="cursor-pointer">
          <Facebook className="mr-2 h-4 w-4 text-[#4267b2]" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareByEmail} className="cursor-pointer">
          <Mail className="mr-2 h-4 w-4" />
          Share via Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
          {copied ? (
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Link className="mr-2 h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
