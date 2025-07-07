import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Users, MessageCircle, MapPin, ShoppingBag, Heart, Globe, Share2 } from "lucide-react";

export default function PublicSignup() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Success!",
        description: "Account created successfully. Welcome to Yogull!",
      });
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Success!",
        description: "Signed in successfully. Welcome back!",
      });
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Platform benefits */}
        <div className="space-y-6">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Join Yogull Community
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with people worldwide, discover local businesses, and build your community
            </p>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Community Connection</h3>
                <p className="text-gray-600">Connect with active members worldwide</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Discussion Forums</h3>
                <p className="text-gray-600">Join 1,225+ active discussions on health, community, and more</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Local Business Directory</h3>
                <p className="text-gray-600">Discover local businesses in your area</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ShoppingBag className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Personal Shop</h3>
                <p className="text-gray-600">Create your own shop and earn from your business</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-pink-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Health & Wellness</h3>
                <p className="text-gray-600">Track supplements, biometrics, and wellness journey</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Globe className="h-8 w-8 text-indigo-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Global Community</h3>
                <p className="text-gray-600">Connect across 8 countries with multi-language support</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Share2 className="h-8 w-8 text-orange-600" />
              <div>
                <h3 className="font-semibold text-gray-900">One-Click Social Sharing</h3>
                <p className="text-gray-600">Share to all social media platforms with just one click - first of its kind technology</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Sign-in/Sign-up form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">

            <CardTitle className="text-2xl">
              {isSignUp ? "Create Your Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? "Join thousands of community members worldwide" 
                : "Sign in to your Yogull account"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isSignUp ? handleSignup : handleSignin} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={isSignUp ? "Choose a secure password" : "Enter your password"}
                />
              </div>
              
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                  />
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading 
                  ? (isSignUp ? "Creating Account..." : "Signing In...") 
                  : (isSignUp ? "Create Account" : "Sign In")
                }
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:underline"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
