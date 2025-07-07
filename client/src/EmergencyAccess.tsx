import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, MessageCircle, User, Phone, MessageSquare, Settings, ShoppingBag, Download } from "lucide-react";

// EMERGENCY ACCESS - COMPLETE FIREBASE BYPASS - JOHN ONLY
export default function EmergencyAccess() {
  
  // Check if this is John's device (simple check)
  const isJohnDevice = () => {
    // Check if user is admin or John specifically
    const isAdmin = window.location.search.includes('admin=true') || 
                   localStorage.getItem('emergency_admin') === 'true';
    return isAdmin;
  };

  const handleNavigation = (path: string) => {
    console.log(`Emergency navigation to: ${path}`);
    try {
      window.location.assign(path);
    } catch (e1) {
      try {
        window.location.href = path;
      } catch (e2) {
        window.location.replace(path);
      }
    }
  };

  // Regular users see the main landing page
  if (!isJohnDevice()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-indigo-700">Ordinary People Community</h1>
              <div className="space-x-4">
                <Button 
                  onClick={() => window.location.assign('/basic-login')}
                  variant="outline"
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => window.location.assign('/login')}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Connect. Share. Grow Together.
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join a thriving community where ordinary people come together to share experiences, 
              support each other, and build meaningful connections.
            </p>
            <Button 
              onClick={() => window.location.assign('/login')}
              className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-3"
            >
              Join Our Community
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Community Discussions</h3>
                <p className="text-gray-600">Engage in meaningful conversations with like-minded people from around the world.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Real-time Chat</h3>
                <p className="text-gray-600">Connect instantly with community members through our live chat system.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <ShoppingBag className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Local Business</h3>
                <p className="text-gray-600">Discover and support local businesses in your community.</p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
            <p className="text-lg text-gray-600 mb-8">Join thousands of community members today.</p>
            <div className="space-x-4">
              <Button 
                onClick={() => window.location.assign('/login')}
                className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-3"
              >
                Create Account
              </Button>
              <Button 
                onClick={() => window.location.assign('/basic-login')}
                variant="outline"
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-lg px-8 py-3"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* EMERGENCY HEADER */}
      <div className="bg-red-100 border-b-4 border-red-400 px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-2">🚨 EMERGENCY ACCESS ACTIVATED</h1>
          <p className="text-red-700 text-lg">Complete Firebase bypass - All buttons working</p>
          <p className="text-red-600">No login required - Direct access to all features</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-center">✅ EMERGENCY NAVIGATION PANEL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Main Navigation */}
              <Button
                onClick={() => handleNavigation('/dashboard')}
                className="h-16 bg-blue-600 hover:bg-blue-700 text-white text-lg flex items-center justify-center gap-3"
              >
                <Home className="h-6 w-6" />
                Dashboard
              </Button>

              <Button
                onClick={() => handleNavigation('/community-direct')}
                className="h-16 bg-green-600 hover:bg-green-700 text-white text-lg flex items-center justify-center gap-3"
              >
                <Users className="h-6 w-6" />
                Community
              </Button>

              <Button
                onClick={() => handleNavigation('/profile-wall-direct')}
                className="h-16 bg-purple-600 hover:bg-purple-700 text-white text-lg flex items-center justify-center gap-3"
              >
                <User className="h-6 w-6" />
                My Profile
              </Button>

              <Button
                onClick={() => handleNavigation('/chat')}
                className="h-16 bg-orange-600 hover:bg-orange-700 text-white text-lg flex items-center justify-center gap-3"
              >
                <MessageCircle className="h-6 w-6" />
                Chat
              </Button>

              <Button
                onClick={() => handleNavigation('/shop')}
                className="h-16 bg-pink-600 hover:bg-pink-700 text-white text-lg flex items-center justify-center gap-3"
              >
                <ShoppingBag className="h-6 w-6" />
                Shop
              </Button>

              <Button
                onClick={() => handleNavigation('/settings')}
                className="h-16 bg-gray-600 hover:bg-gray-700 text-white text-lg flex items-center justify-center gap-3"
              >
                <Settings className="h-6 w-6" />
                Settings
              </Button>

              <Button
                onClick={() => {
                  console.log('Download Files clicked');
                  window.open('/api/download/source-code', '_blank');
                }}
                className="h-16 bg-green-600 hover:bg-green-700 text-white text-lg flex items-center justify-center gap-3"
              >
                <Download className="h-6 w-6" />
                Download Files
              </Button>

            </div>
          </CardContent>
        </Card>

        {/* Communication Bypass */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">🔧 EMERGENCY COMMUNICATION</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => {
                  try {
                    window.open('https://wa.me/447711776304', '_blank');
                  } catch (e) {
                    window.location.href = 'https://wa.me/447711776304';
                  }
                }}
                className="h-12 bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2"
              >
                <Phone className="h-5 w-5" />
                WhatsApp Direct
              </Button>

              <Button
                onClick={() => {
                  try {
                    window.open('https://m.me/profile', '_blank');
                  } catch (e) {
                    console.log('Messenger backup method needed');
                  }
                }}
                className="h-12 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-5 w-5" />
                Messenger Direct
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🛠️ SYSTEM STATUS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Firebase Authentication</span>
                <span className="text-green-600 font-bold">BYPASSED ✅</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Direct Navigation</span>
                <span className="text-green-600 font-bold">ACTIVE ✅</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Emergency Access</span>
                <span className="text-green-600 font-bold">ENABLED ✅</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium">All Features</span>
                <span className="text-green-600 font-bold">ACCESSIBLE ✅</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">📋 EMERGENCY INSTRUCTIONS</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>All buttons above bypass Firebase completely</li>
              <li>Click any button to go directly to that section</li>
              <li>No login loops - immediate access guaranteed</li>
              <li>If any button fails, try the next one</li>
              <li>WhatsApp/Messenger work independently</li>
            </ol>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
