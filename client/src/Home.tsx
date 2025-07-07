import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { User } from "@shared/schema";
import { onAuthStateChange, getCurrentAppUser } from "@/lib/auth";
import { useTutorial } from "@/hooks/useTutorial";
import { usePWA } from "@/hooks/usePWA";
import { LoginForm } from "@/components/LoginForm";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Dashboard } from "@/components/Dashboard";
import { NavigationHelp } from "@/components/NavigationHelp";
import { TutorialPopup } from "@/components/TutorialPopup";
import { useLocation } from "wouter";
import { Leaf, Loader2 } from "lucide-react";

export default function Home() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [location] = useLocation();
  const { shouldShowTutorial, getTutorialSteps, markTutorialComplete } = useTutorial();
  const { requestNotificationPermission, showNotification } = usePWA();

  useEffect(() => {
    // Production mode - Firebase authentication only
    // Clear any demo data from localStorage
    localStorage.removeItem('demoUser');
    
    // Check for cached user data to reduce loading time
    const cachedUser = localStorage.getItem('auth_user');
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        setAppUser(userData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to parse cached user data:', error);
      }
    }
    
    // Initialize Firebase authentication
    const unsubscribe = onAuthStateChange(async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        const userData = await getCurrentAppUser(user.uid);
        setAppUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
      } else {
        setAppUser(null);
        localStorage.removeItem('auth_user');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLoginSuccess = async () => {
    // The auth state change will handle updating the user state
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Leaf className="text-white text-2xl" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ordinary People Community</h2>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="animate-spin text-primary" size={20} />
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!firebaseUser || !appUser) {
    return <LoginForm onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="lg:flex lg:h-screen">
      <Sidebar user={appUser} />
      <MobileNav user={appUser} />
      <Dashboard user={appUser} />
      <NavigationHelp />
      
      {/* Tutorial popup for first-time visitors */}
      {shouldShowTutorial(location) && (
        <TutorialPopup
          page={location}
          steps={getTutorialSteps(location)}
          onComplete={() => markTutorialComplete(location)}
          onSkip={() => markTutorialComplete(location)}
        />
      )}
    </div>
  );
}
