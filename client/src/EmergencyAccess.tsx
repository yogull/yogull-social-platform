import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";

import { useParams, Link } from "wouter";
import { PageHelpSystem } from "@/components/PageHelpSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Users, MessageCircle, ArrowLeft, X } from "lucide-react";
import type { CommunityDiscussion, DiscussionCategory, DiscussionMessage } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

// FORCE CACHE CLEAR - New Mobile Discussion Interface v3.0
export default function CategoryDiscussion() {
  const { categoryId } = useParams();
  const { appUser: user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  

  
  const [selectedDiscussion, setSelectedDiscussion] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  // Get category details
  const { data: category } = useQuery<DiscussionCategory>({
    queryKey: ["/api/discussion-categories", categoryId],
    queryFn: async () => {
      const response = await fetch(`/api/discussion-categories/${categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch category');
      return response.json();
    },
  });

  // Get discussions for this category
  const { data: discussions = [] } = useQuery<CommunityDiscussion[]>({
    queryKey: ["/api/community-discussions", categoryId],
    queryFn: async () => {
      const response = await fetch(`/api/community-discussions?categoryId=${categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch discussions');
      return response.json();
    },
  });

  // Get messages for selected discussion
  const { data: messages = [], isLoading: messagesLoading } = useQuery<DiscussionMessage[]>({
    queryKey: ["/api/discussion-messages", selectedDiscussion],
    enabled: !!selectedDiscussion && selectedDiscussion > 0,
    queryFn: async () => {
      const response = await fetch(`/api/discussion-messages?discussionId=${selectedDiscussion}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
  });

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async (data: { discussionId: number; content: string }) => {
      const response = await apiRequest("POST", "/api/discussion-messages", {
        ...data,
        userId: user?.id || 0,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussion-messages", selectedDiscussion] });
      setMessageInput("");
      toast({
        title: "Message Sent",
        description: "Your message has been added to the discussion.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleJoinDiscussion = (discussionId: number) => {
    setSelectedDiscussion(discussionId);
    setShowMessageDialog(true);
  };

  const handleSendMessage = () => {
    if (!selectedDiscussion || !messageInput.trim()) return;
    
    addMessageMutation.mutate({
      discussionId: selectedDiscussion,
      content: messageInput.trim(),
    });
  };

  const closeDialog = () => {
    setShowMessageDialog(false);
    setSelectedDiscussion(null);
    setMessageInput("");
  };

  if (!category) return <div>Loading...</div>;

  return (
    <div className="max-w-[95vw] mx-auto px-2 py-4">
      <PageHelpSystem currentPage="community" />
      

      
      <PageHeader title={`${category.name} Discussions`} />

      <div className="mb-4">
        <Link href="/community">
          <Button variant="outline" size="sm" className="bg-blue-100 border-blue-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community
          </Button>
        </Link>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <Card className="w-full max-w-[90vw] mx-auto">
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
              <p className="text-muted-foreground">Be the first to start a discussion!</p>
            </CardContent>
          </Card>
        ) : (
          discussions.map((discussion) => (
            <Card key={discussion.id} className="w-full max-w-[90vw] mx-auto">
              <CardHeader className="pb-3">
                <CardTitle className="text-base break-words">
                  {discussion.title}
                </CardTitle>
                {discussion.location && (
                  <Badge variant="outline" className="w-fit">
                    <MapPin className="w-3 h-3 mr-1" />
                    {discussion.location}
                  </Badge>
                )}
                <p className="text-sm text-muted-foreground break-words">
                  {discussion.description}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{discussion.participantCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{discussion.messageCount || 0}</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleJoinDiscussion(discussion.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Join Discussion
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Messages Dialog */}
      {showMessageDialog && selectedDiscussion && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDialog}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-[95vw] max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {discussions.find(d => d.id === selectedDiscussion)?.title}
              </h3>
              <Button variant="ghost" size="sm" onClick={closeDialog}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[50vh]">
              {messagesLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback>
                        {(message as any).userName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-1">
                        {(message as any).userName || `User ${message.userId}`}
                      </div>
                      <p className="text-sm break-words mb-1">{message.content}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || addMessageMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {addMessageMutation.isPending ? "..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
