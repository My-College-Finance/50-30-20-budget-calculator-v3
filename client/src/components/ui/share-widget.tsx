import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Share, Send, Search, Twitter, Facebook, Linkedin, Mail, Cloud } from "lucide-react";
import { useBudgetContext } from "@/context/budget-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function ShareWidget() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { budget, isCalculated } = useBudgetContext();
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isCalculated) {
      toast({
        title: "No budget calculated",
        description: "Please calculate a budget first before sending an email report.",
        variant: "destructive",
      });
      return;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    try {
      const response = await apiRequest("POST", "/api/email/report", {
        email,
        budget
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Email sent",
          description: "Your budget report has been sent to your email.",
        });
        
        // If we're using a test email service, show preview URL
        if (data.previewUrl) {
          window.open(data.previewUrl, '_blank');
        }
        
        setEmail("");
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      toast({
        title: "Email failed",
        description: "There was an error sending your email report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isCalculated) {
      toast({
        title: "No budget calculated",
        description: "Please calculate a budget first before saving to Google Drive.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Import the Google Drive API functions
      const { getGoogleAuthUrl, uploadBudgetToDrive } = await import('@/lib/google-drive');
      
      try {
        // Try to upload directly first - this will work if already authenticated
        const result = await uploadBudgetToDrive(budget!);
        
        if (result.needsAuth) {
          // User needs to authenticate - the API already handled the redirect
          return;
        }
        
        // Upload was successful
        toast({
          title: "Saved to Google Drive",
          description: "Your budget has been successfully saved to your Google Drive.",
        });
      } catch (error: any) {
        if (error.message?.includes('authentication required')) {
          // Get auth URL and redirect
          const authUrl = await getGoogleAuthUrl();
          window.location.href = authUrl;
          return;
        }
        
        // Other error
        throw error;
      }
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      toast({
        title: "Failed to save",
        description: "There was an error saving your budget to Google Drive. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareOnTwitter = () => {
    const text = `Try this 50/30/20 Budget Calculator from My College Finance! Great tool for financial planning.`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const title = "My College Finance's 50/30/20 Budget Calculator";
    const summary = "A helpful financial planning tool for college students";
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`, '_blank');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Share className="h-5 w-5 text-primary dark:text-primary-light mr-2" />
          Save & Share
        </h2>
        
        <div className="space-y-4">
          <div>
            <form onSubmit={handleEmailSubmit} className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Report
              </label>
              <div className="flex">
                <Input 
                  type="email" 
                  id="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-r-none"
                />
                <Button 
                  type="submit" 
                  className="rounded-l-none bg-primary hover:bg-primary-dark"
                  disabled={isSending}
                >
                  {isSending ? <Mail className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Save your budget report
            </p>
            <Button 
              onClick={handleGoogleSignIn} 
              variant="outline" 
              className="w-full"
            >
              <Cloud className="mr-2 h-4 w-4" />
              Save to Google Drive
            </Button>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Share this calculator
            </p>
            <div className="flex space-x-2">
              <Button 
                onClick={shareOnTwitter} 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-[#1DA1F2] hover:bg-[#1a93df] text-white border-none"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button 
                onClick={shareOnFacebook} 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-[#4267B2] hover:bg-[#3b5d9f] text-white border-none"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button 
                onClick={shareOnLinkedIn} 
                size="icon" 
                variant="outline" 
                className="rounded-full bg-[#0077B5] hover:bg-[#006699] text-white border-none"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
