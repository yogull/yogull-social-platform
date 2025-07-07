import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Users, Plus, Share2, Search } from 'lucide-react';

// Multilingual translation system - PERMANENT WORKING SOLUTION
const translations = {
  en: {
    title: 'Community Discussions',
    allCategories: 'All Categories',
    createNew: 'Create New Discussion',
    discussionTitle: 'Discussion Title',
    description: 'Description',
    location: 'Location',
    tags: 'Tags',
    createDiscussion: 'Create Discussion',
    cancel: 'Cancel',
    joinDiscussion: 'Join Discussion',
    share: 'Share',
    search: 'Search discussions...'
  },
  es: {
    title: 'Discusiones de la Comunidad',
    allCategories: 'Todas las Categorías',
    createNew: 'Crear Nueva Discusión',
    discussionTitle: 'Título de la Discusión',
    description: 'Descripción',
    location: 'Ubicación',
    tags: 'Etiquetas',
    createDiscussion: 'Crear Discusión',
    cancel: 'Cancelar',
    joinDiscussion: 'Unirse a la Discusión',
    share: 'Compartir',
    search: 'Buscar discusiones...'
  },
  fr: {
    title: 'Discussions Communautaires',
    allCategories: 'Toutes les Catégories',
    createNew: 'Créer une Nouvelle Discussion',
    discussionTitle: 'Titre de la Discussion',
    description: 'Description',
    location: 'Emplacement',
    tags: 'Étiquettes',
    createDiscussion: 'Créer Discussion',
    cancel: 'Annuler',
    joinDiscussion: 'Rejoindre Discussion',
    share: 'Partager',
    search: 'Rechercher discussions...'
  },
  de: {
    title: 'Gemeinschaftsdiskussionen',
    allCategories: 'Alle Kategorien',
    createNew: 'Neue Diskussion Erstellen',
    discussionTitle: 'Diskussionstitel',
    description: 'Beschreibung',
    location: 'Standort',
    tags: 'Tags',
    createDiscussion: 'Diskussion Erstellen',
    cancel: 'Abbrechen',
    joinDiscussion: 'Diskussion Beitreten',
    share: 'Teilen',
    search: 'Diskussionen suchen...'
  },
  pt: {
    title: 'Discussões da Comunidade',
    allCategories: 'Todas as Categorias',
    createNew: 'Criar Nova Discussão',
    discussionTitle: 'Título da Discussão',
    description: 'Descrição',
    location: 'Localização',
    tags: 'Tags',
    createDiscussion: 'Criar Discussão',
    cancel: 'Cancelar',
    joinDiscussion: 'Participar da Discussão',
    share: 'Compartilhar',
    search: 'Buscar discussões...'
  }
};

// Auto-detect user language based on browser/location
const detectUserLanguage = () => {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('pt')) return 'pt';
  return 'en'; // Default to English
};

interface Discussion {
  id: number;
  userId: number;
  categoryId: number;
  title: string;
  description: string;
  location?: string;
  tags: string[] | null;
  participantCount?: number;
  messageCount?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  autoCategory?: string;
  subcategory?: string;
}

const categories = [
  { id: 1, name: 'Government & Politics', icon: '🏛️', keywords: ['government', 'politics', 'election', 'policy', 'minister', 'mp', 'council', 'tax', 'voting', 'parliament', 'gobierno', 'politique', 'regierung', 'governo'] },
  { id: 2, name: 'Health & Wellness', icon: '🏥', keywords: ['health', 'medical', 'doctor', 'hospital', 'nhs', 'medicine', 'treatment', 'wellness', 'fitness', 'mental', 'salud', 'santé', 'gesundheit', 'saúde'] },
  { id: 3, name: 'Environment & Climate', icon: '🌍', keywords: ['environment', 'climate', 'pollution', 'green', 'sustainability', 'recycling', 'carbon', 'energy', 'weather', 'medio ambiente', 'environnement', 'umwelt', 'ambiente'] },
  { id: 4, name: 'Technology & Digital', icon: '💻', keywords: ['technology', 'digital', 'internet', 'computer', 'software', 'app', 'online', 'tech', 'ai', 'data', 'tecnología', 'technologie', 'technologie', 'tecnologia'] },
  { id: 5, name: 'Community & Social', icon: '🤝', keywords: ['community', 'social', 'local', 'neighborhood', 'volunteer', 'charity', 'help', 'support', 'events', 'comunidad', 'communauté', 'gemeinschaft', 'comunidade'] },
  { id: 6, name: 'Education & Learning', icon: '📚', keywords: ['education', 'school', 'university', 'learning', 'teaching', 'student', 'course', 'training', 'study', 'educación', 'éducation', 'bildung', 'educação'] },
  { id: 7, name: 'Economy & Finance', icon: '💰', keywords: ['economy', 'finance', 'money', 'business', 'job', 'work', 'employment', 'cost', 'price', 'budget', 'economía', 'économie', 'wirtschaft', 'economia'] },
  { id: 8, name: 'Transport & Travel', icon: '🚗', keywords: ['transport', 'travel', 'bus', 'train', 'car', 'road', 'traffic', 'journey', 'airport', 'station', 'transporte', 'transport', 'verkehr', 'transporte'] },
  { id: 9, name: 'Law & Legal', icon: '⚖️', keywords: ['law', 'legal', 'court', 'judge', 'lawyer', 'attorney', 'justice', 'rights', 'lawsuit', 'legislation', 'ley', 'loi', 'gesetz', 'lei'] },
  { id: 10, name: 'Common Law', icon: '📜', keywords: ['common law', 'constitutional', 'civil rights', 'human rights', 'freedom', 'liberty', 'constitution', 'amendment', 'derecho común', 'droit commun', 'gewohnheitsrecht', 'direito comum'] },
  { id: 11, name: 'Housing & Property', icon: '🏠', keywords: ['housing', 'property', 'rent', 'mortgage', 'landlord', 'tenant', 'real estate', 'home', 'apartment', 'vivienda', 'logement', 'wohnung', 'habitação'] },
  { id: 12, name: 'Crime & Safety', icon: '🚨', keywords: ['crime', 'safety', 'police', 'security', 'theft', 'violence', 'emergency', 'investigation', 'crimen', 'criminalité', 'kriminalität', 'crime'] },
  { id: 13, name: 'Immigration & Visas', icon: '🛂', keywords: ['immigration', 'visa', 'passport', 'citizenship', 'refugee', 'asylum', 'border', 'customs', 'inmigración', 'immigration', 'einwanderung', 'imigração'] },
  { id: 14, name: 'Sports & Recreation', icon: '⚽', keywords: ['sports', 'recreation', 'football', 'rugby', 'cricket', 'tennis', 'gym', 'fitness', 'exercise', 'deportes', 'sport', 'sport', 'esportes'] },
  { id: 15, name: 'Arts & Culture', icon: '🎨', keywords: ['arts', 'culture', 'music', 'theatre', 'museum', 'festival', 'painting', 'literature', 'arte', 'art', 'kunst', 'arte'] },
  { id: 16, name: 'Food & Dining', icon: '🍽️', keywords: ['food', 'restaurant', 'dining', 'cooking', 'recipe', 'cuisine', 'nutrition', 'chef', 'comida', 'nourriture', 'essen', 'comida'] },
  { id: 17, name: 'Shopping & Consumer', icon: '🛒', keywords: ['shopping', 'consumer', 'retail', 'purchase', 'product', 'store', 'market', 'price', 'compras', 'shopping', 'einkaufen', 'compras'] },
  { id: 18, name: 'Weather & Natural Events', icon: '🌦️', keywords: ['weather', 'rain', 'snow', 'flood', 'storm', 'earthquake', 'natural disaster', 'clima', 'météo', 'wetter', 'clima'] },
  { id: 19, name: 'Religion & Spirituality', icon: '⛪', keywords: ['religion', 'church', 'spiritual', 'faith', 'prayer', 'worship', 'belief', 'religión', 'religion', 'religion', 'religião'] },
  { id: 20, name: 'Family & Relationships', icon: '👨‍👩‍👧‍👦', keywords: ['family', 'relationship', 'marriage', 'children', 'parenting', 'dating', 'divorce', 'familia', 'famille', 'familie', 'família'] }
];

// Auto-categorization function with dynamic category creation - PERMANENT WORKING SOLUTION
const autoDetectCategory = (title: string, description: string) => {
  const text = (title + ' ' + description).toLowerCase();
  
  // First, try to match existing categories
  for (const category of categories) {
    for (const keyword of category.keywords) {
      if (text.includes(keyword)) {
        return {
          categoryId: category.id,
          categoryName: category.name,
          detectedKeyword: keyword
        };
      }
    }
  }
  
  // If no match found, create dynamic category based on prominent words
  const words = text.split(' ').filter(word => word.length > 3 && 
    !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'were', 'what', 'when', 'where', 'will', 'would', 'could', 'should'].includes(word));
  
  if (words.length > 0) {
    const prominentWord = words[0];
    const categoryName = prominentWord.charAt(0).toUpperCase() + prominentWord.slice(1) + ' Discussion';
    
    return {
      categoryId: 99, // Dynamic category ID
      categoryName: categoryName,
      detectedKeyword: prominentWord,
      isDynamic: true
    };
  }
  
  return { categoryId: 5, categoryName: 'Community & Social', detectedKeyword: 'general' }; // Default
};

export default function CommunitySimple() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLanguage] = useState(detectUserLanguage());
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    description: '',
    location: '',
    tags: ''
  });

  // Get translations for user's language
  const t = translations[userLanguage as keyof typeof translations] || translations.en;

  // Load discussions with auto-categorization and sliding window
  useEffect(() => {
    const loadDiscussions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/discussions');
        if (response.ok) {
          const data = await response.json();
          
          // Apply sliding window: keep latest 50, archive older ones
          const latestDiscussions = data.slice(0, 50);
          
          // Auto-categorize discussions based on content
          const categorizedDiscussions = latestDiscussions.map((discussion: Discussion) => {
            const autoCategory = autoDetectCategory(discussion.title, discussion.description);
            return {
              ...discussion,
              autoCategory: autoCategory.categoryName,
              subcategory: autoCategory.detectedKeyword,
              categoryId: autoCategory.categoryId
            };
          });
          
          setDiscussions(categorizedDiscussions);
          console.log(`✅ Loaded ${categorizedDiscussions.length} discussions with auto-categorization`);
          
          // Archive older discussions to brain storage if needed
          if (data.length > 50) {
            const archivedDiscussions = data.slice(50).map((discussion: Discussion) => {
              const autoCategory = autoDetectCategory(discussion.title, discussion.description);
              return {
                ...discussion,
                category: autoCategory.categoryName,
                subcategory: autoCategory.detectedKeyword,
                archivedDate: new Date().toISOString()
              };
            });

            // Send to brain archive
            fetch('/api/brain/archive-discussions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ discussions: archivedDiscussions })
            }).catch(err => console.error('Archive error:', err));
          }
        } else {
          setError('Failed to load discussions');
        }
      } catch (err) {
        setError('Network error loading discussions');
        console.error('Error loading discussions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDiscussions();
  }, []);

  // Filter discussions
  const filteredPosts = discussions.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.categoryId === parseInt(selectedCategory);
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.autoCategory && post.autoCategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.subcategory && post.subcategory.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCreateDiscussion = async () => {
    if (!newDiscussion.title.trim() || !newDiscussion.description.trim()) {
      alert('Please fill in both title and description');
      return;
    }

    try {
      // Auto-detect category before submitting
      const autoCategory = autoDetectCategory(newDiscussion.title, newDiscussion.description);
      
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDiscussion,
          categoryId: autoCategory.categoryId,
          tags: newDiscussion.tags ? newDiscussion.tags.split(',').map(t => t.trim()) : [autoCategory.detectedKeyword],
        }),
      });

      if (response.ok) {
        alert(`Discussion created in "${autoCategory.categoryName}" category!`);
        setNewDiscussion({ title: '', description: '', location: '', tags: '' });
        setIsCreating(false);
        window.location.reload();
      } else {
        throw new Error('Failed to create discussion');
      }
    } catch (error) {
      alert('Failed to create discussion. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl min-w-0 overflow-hidden w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">{t.title}</h1>
          <p className="text-gray-600 break-words">Smart categorization • Latest 50 active • Searchable archive</p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full min-w-[200px] bg-white border-2 border-gray-300 hover:border-blue-500">
                    <SelectValue placeholder="🔽 Select Category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px] overflow-y-auto bg-white border-2 border-gray-300 shadow-lg z-50">
                    <SelectItem value="all" className="hover:bg-blue-50">
                      📂 {t.allCategories}
                    </SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()} className="hover:bg-blue-50">
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value="all" onValueChange={() => {}}>
                  <SelectTrigger className="w-full min-w-[180px] bg-white border-2 border-gray-300 hover:border-blue-500">
                    <SelectValue placeholder="🏷️ Subcategory" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px] overflow-y-auto bg-white border-2 border-gray-300 shadow-lg z-50">
                    <SelectItem value="all" className="hover:bg-blue-50">
                      📋 All Subcategories
                    </SelectItem>
                    <SelectItem value="general" className="hover:bg-blue-50">
                      🔍 General Discussion
                    </SelectItem>
                    <SelectItem value="news" className="hover:bg-blue-50">
                      📰 News & Updates
                    </SelectItem>
                    <SelectItem value="help" className="hover:bg-blue-50">
                      ❓ Help & Support
                    </SelectItem>
                    <SelectItem value="announcements" className="hover:bg-blue-50">
                      📢 Announcements
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {t.createNew}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Discussion Form */}
        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">Create New Discussion</h3>
              <p className="text-sm text-gray-600">Category will be automatically detected from your content</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    placeholder="What would you like to discuss?"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({...newDiscussion, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    placeholder="Provide details about your discussion topic..."
                    value={newDiscussion.description}
                    onChange={(e) => setNewDiscussion({...newDiscussion, description: e.target.value})}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Location (Optional)</label>
                    <Input
                      placeholder="e.g., London, UK"
                      value={newDiscussion.location}
                      onChange={(e) => setNewDiscussion({...newDiscussion, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Additional Tags</label>
                    <Input
                      placeholder="e.g., urgent, local, community"
                      value={newDiscussion.tags}
                      onChange={(e) => setNewDiscussion({...newDiscussion, tags: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleCreateDiscussion} className="flex-1">
                    Create Discussion (Auto-Categorized)
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Display */}
        {!isLoading && !error && filteredPosts.length > 0 && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-center">
              <div>
                <strong>✅ Smart Community System Working!</strong>
                <p>Showing {filteredPosts.length} discussions • Auto-categorized • Archive system active</p>
              </div>
              <div className="text-right text-sm">
                <p>Latest 50 active</p>
                <p>Older archived to brain</p>
              </div>
            </div>
          </div>
        )}

        {/* Discussions Display */}
        <div className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Loading community discussions...
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2 text-red-600">Unable to load discussions</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </CardContent>
            </Card>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">No discussions found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "No discussions match your search." : "Be the first to start a discussion!"}
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Discussion
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow overflow-hidden">
                <CardHeader className="overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {post.title.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="font-semibold text-lg break-words break-all overflow-hidden text-ellipsis max-w-full"
                            style={{
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                              wordWrap: 'break-word',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              maxWidth: '75vw'
                            }}
                        >
                          {post.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1 max-w-full overflow-hidden">
                          {post.autoCategory && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs break-words max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                              {post.autoCategory}
                            </span>
                          )}
                          {post.subcategory && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs break-words max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                              {post.subcategory}
                            </span>
                          )}
                          {post.location && <span className="break-words max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">📍 {post.location}</span>}
                          <span className="break-words">🗓️ {new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{post.participantCount || 0}</span>
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.messageCount || 0}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="overflow-hidden">
                  <div className="text-gray-700 mb-4 break-words overflow-hidden max-w-full">
                    <p className="break-words break-all whitespace-pre-wrap word-break-break-all hyphens-auto max-w-full"
                       style={{
                         wordBreak: 'break-word',
                         overflowWrap: 'anywhere',
                         wordWrap: 'break-word',
                         maxWidth: '100%'
                       }}
                    >
                      {/* Remove duplicate "Read more" links from description and replace with clickable navigation */}
                      {post.description.replace(/🔗 Read more: [^\n]+/g, '')}
                    </p>
                    {/* Single clickable "Read more" link for navigation */}
                    <div className="mt-2">
                      <a 
                        href={`/category-discussion/${post.categoryId}?discussionId=${post.id}`}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer underline text-sm font-medium"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/category-discussion/${post.categoryId}?discussionId=${post.id}`;
                        }}
                      >
                        💬 Join Discussion
                      </a>
                    </div>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 max-w-full overflow-hidden">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full break-words max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = `/category-discussion/${post.categoryId}?discussionId=${post.id}`;
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Join Discussion
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + `/category-discussion/${post.categoryId}?discussionId=${post.id}`);
                        alert('Discussion link copied!');
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
