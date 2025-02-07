import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CameraFeed from "@/components/camera-feed";
import CaptureHistory from "@/components/capture-history";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import type { Capture } from "@shared/schema";

export default function Home() {
  const [activeTab, setActiveTab] = useState("live");
  const { toast } = useToast();

  const { data: captures = [], isLoading } = useQuery<Capture[]>({
    queryKey: ["/api/captures"],
  });

  const handleCapture = async (imageData: string) => {
    try {
      await apiRequest("POST", "/api/captures", { imageData });
      await queryClient.invalidateQueries({ queryKey: ["/api/captures"] });
      toast({
        title: "Success",
        description: "Image captured successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save capture",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">ANPR System</h1>
        <p className="text-muted-foreground">
          Automatic Number Plate Recognition with camera integration
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="live">Live Camera</TabsTrigger>
              <TabsTrigger value="history">Capture History</TabsTrigger>
            </TabsList>

            <TabsContent value="live">
              <CameraFeed onCapture={handleCapture} />
            </TabsContent>

            <TabsContent value="history">
              <CaptureHistory captures={captures} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
