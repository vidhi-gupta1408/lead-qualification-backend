import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/ui/file-upload';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { 
  ChartLine, 
  Bell, 
  Settings, 
  Check, 
  Upload, 
  Play, 
  Download, 
  Filter, 
  RotateCcw,
  Eye,
  Mail,
  ChevronLeft,
  ChevronRight,
  Bot,
  Info
} from 'lucide-react';

export default function Home() {
  const [offerData, setOfferData] = useState({
    name: '',
    value_props: '',
    ideal_use_cases: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isOfferSubmitted, setIsOfferSubmitted] = useState(false);
  const [isLeadsUploaded, setIsLeadsUploaded] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Submit offer mutation
  const submitOfferMutation = useMutation({
    mutationFn: api.submitOffer,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product details saved successfully",
      });
      setIsOfferSubmitted(true);
      setCurrentStep(2);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save product details",
        variant: "destructive",
      });
    },
  });

  // Upload leads mutation
  const uploadLeadsMutation = useMutation({
    mutationFn: api.uploadLeads,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      setIsLeadsUploaded(true);
      setCurrentStep(3);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload leads",
        variant: "destructive",
      });
    },
  });

  // Score leads mutation
  const scoreLeadsMutation = useMutation({
    mutationFn: api.scoreLeads,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/results'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to score leads",
        variant: "destructive",
      });
    },
  });

  // Get results query
  const resultsQuery = useQuery<{success: boolean; data: any[]}>({
    queryKey: ['/api/results'],
    enabled: false, // Only fetch after scoring
  });

  // Export CSV mutation
  const exportCsvMutation = useMutation({
    mutationFn: api.exportCsv,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Results exported successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to export CSV",
        variant: "destructive",
      });
    },
  });

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitOfferMutation.mutate(offerData);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleLeadsUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a CSV file first",
        variant: "destructive",
      });
      return;
    }
    uploadLeadsMutation.mutate(selectedFile);
  };

  const handleScoreLeads = () => {
    scoreLeadsMutation.mutate();
  };

  const getIntentBadgeVariant = (intent: string) => {
    switch (intent) {
      case 'High': return 'default';
      case 'Medium': return 'secondary';
      case 'Low': return 'destructive';
      default: return 'outline';
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'High': return 'text-chart-2';
      case 'Medium': return 'text-chart-3';
      case 'Low': return 'text-chart-5';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <ChartLine className="text-primary-foreground text-sm" />
                </div>
                <h1 className="text-xl font-semibold text-foreground">Lead Qualification Platform</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-settings">
                <Settings className="h-4 w-4" />
              </Button>
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Process Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Lead Scoring Pipeline</h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Complete steps 1-3 to score your leads</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {isOfferSubmitted ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Product/Offer</span>
            </div>
            <div className="flex-1 h-px bg-border"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {isLeadsUploaded ? <Check className="h-4 w-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Upload Leads</span>
            </div>
            <div className="flex-1 h-px bg-border"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>3</div>
              <span className="text-sm font-medium">Score & Results</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product/Offer Form */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Step 1: Product/Offer Details</CardTitle>
                <div className="text-sm text-muted-foreground">POST /offer</div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOfferSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    name="name"
                    value={offerData.name}
                    onChange={(e) => setOfferData({...offerData, name: e.target.value})}
                    placeholder="e.g., AI Outreach Automation"
                    required
                    data-testid="input-product-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="valueProps">Value Propositions</Label>
                  <Textarea
                    id="valueProps"
                    name="value_props"
                    value={offerData.value_props}
                    onChange={(e) => setOfferData({...offerData, value_props: e.target.value})}
                    placeholder="Enter each value prop on a new line&#10;e.g., 24/7 outreach&#10;6x more meetings"
                    rows={3}
                    required
                    data-testid="textarea-value-props"
                  />
                </div>
                
                <div>
                  <Label htmlFor="idealUseCases">Ideal Use Cases</Label>
                  <Textarea
                    id="idealUseCases"
                    name="ideal_use_cases"
                    value={offerData.ideal_use_cases}
                    onChange={(e) => setOfferData({...offerData, ideal_use_cases: e.target.value})}
                    placeholder="Enter target use cases&#10;e.g., B2B SaaS mid-market&#10;Enterprise sales teams"
                    rows={3}
                    required
                    data-testid="textarea-ideal-use-cases"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitOfferMutation.isPending}
                  data-testid="button-save-offer"
                >
                  {submitOfferMutation.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Product Details
                    </>
                  )}
                </Button>
              </form>
              
              {isOfferSubmitted && (
                <div className="mt-4 p-4 bg-chart-2/10 border border-chart-2/20 rounded-md">
                  <div className="flex items-center">
                    <Check className="text-chart-2 mr-2 h-4 w-4" />
                    <span className="text-sm text-chart-2">Product details saved successfully</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leads Upload */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Step 2: Upload Leads</CardTitle>
                <div className="text-sm text-muted-foreground">POST /leads/upload</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <FileUpload onFileSelect={handleFileSelect} />
                
                <Button 
                  onClick={handleLeadsUpload}
                  className="w-full"
                  disabled={!selectedFile || uploadLeadsMutation.isPending}
                  data-testid="button-upload-leads"
                >
                  {uploadLeadsMutation.isPending ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Leads
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scoring Section */}
        <Card className="shadow-sm mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Step 3: Score Leads</CardTitle>
              <div className="text-sm text-muted-foreground">POST /score</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Scoring Rules</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                    <span>Decision maker role</span>
                    <span className="font-medium text-chart-2">+20 points</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                    <span>Influencer role</span>
                    <span className="font-medium text-chart-3">+10 points</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                    <span>Exact industry match</span>
                    <span className="font-medium text-chart-2">+20 points</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                    <span>Adjacent industry</span>
                    <span className="font-medium text-chart-3">+10 points</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                    <span>Complete data</span>
                    <span className="font-medium text-chart-2">+10 points</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">AI Enhancement</h4>
                <div className="p-4 bg-muted/30 rounded-md">
                  <div className="flex items-center space-x-2 mb-3">
                    <Bot className="text-primary h-4 w-4" />
                    <span className="text-sm font-medium">OpenAI GPT-5 Analysis</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    AI analyzes prospect context and provides intent classification with reasoning.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>High Intent</span>
                      <span className="font-medium">+50 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium Intent</span>
                      <span className="font-medium">+30 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low Intent</span>
                      <span className="font-medium">+10 points</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {isLeadsUploaded && (
              <div className="flex items-center justify-between p-4 bg-accent rounded-md mb-6">
                <div className="flex items-center space-x-3">
                  <Info className="text-primary h-4 w-4" />
                  <span className="text-sm">Ready to score leads with AI-enhanced analysis</span>
                </div>
                <div className="text-sm font-medium">Est. time: ~30 seconds</div>
              </div>
            )}
            
            <Button 
              onClick={handleScoreLeads}
              className="w-full text-lg py-3"
              disabled={!isLeadsUploaded || scoreLeadsMutation.isPending}
              data-testid="button-score-leads"
            >
              {scoreLeadsMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scoring in Progress...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Scoring Pipeline
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Scoring Results</CardTitle>
                <p className="text-sm text-muted-foreground">GET /results</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportCsvMutation.mutate()}
                  disabled={!resultsQuery.data?.data?.length || exportCsvMutation.isPending}
                  data-testid="button-export-csv"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" data-testid="button-filter">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => resultsQuery.refetch()}
                  data-testid="button-refresh"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {resultsQuery.data?.data?.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Intent</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Reasoning</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultsQuery.data.data.map((result: any, index: number) => (
                      <TableRow key={result.id} className="hover:bg-muted/20" data-testid={`row-lead-${index}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground" data-testid={`text-lead-name-${index}`}>
                              {result.name}
                            </div>
                            <div className="text-sm text-muted-foreground" data-testid={`text-lead-role-${index}`}>
                              {result.role}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground" data-testid={`text-company-${index}`}>
                            {result.company}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.industry} • {result.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getIntentBadgeVariant(result.intent)}
                            className="flex items-center gap-1"
                            data-testid={`badge-intent-${index}`}
                          >
                            <div className={`w-2 h-2 rounded-full ${getIntentColor(result.intent)} opacity-75`} />
                            {result.intent}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="text-lg font-semibold text-foreground" data-testid={`text-score-${index}`}>
                              {result.score}
                            </div>
                            <Progress 
                              value={result.score} 
                              className="w-16 h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-muted-foreground truncate" data-testid={`text-reasoning-${index}`}>
                            {result.reasoning}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" data-testid={`button-view-${index}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-email-${index}`}>
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No results available. Complete the scoring pipeline to see results.</p>
              </div>
            )}
            
            {resultsQuery.data?.data?.length > 0 && (
              <div className="p-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {resultsQuery.data.data.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" data-testid="button-previous">
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button size="sm">1</Button>
                    <Button variant="outline" size="sm" data-testid="button-next">
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
