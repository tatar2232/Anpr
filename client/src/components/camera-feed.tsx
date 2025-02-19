import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImagePreview from "./image-preview";

interface Props {
  onCapture: (imageData: string) => void;
}

export default function CameraFeed({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Kamerafeil",
        description: "Kunne ikke få tilgang til kamera",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        title: "Feil",
        description: "Kunne ikke ta bilde, prøv igjen",
        variant: "destructive",
      });
      return;
    }

    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) {
      toast({
        title: "Feil",
        description: "Video er ikke klar ennå, vent litt og prøv igjen",
        variant: "destructive",
      });
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast({
        title: "Feil",
        description: "Kunne ikke behandle bildet",
        variant: "destructive",
      });
      return;
    }

    try {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setPreview(imageData);
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke ta bilde, prøv igjen",
        variant: "destructive",
      });
    }
  };

  const handleAccept = () => {
    if (preview) {
      onCapture(preview);
      setPreview(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Kamera er ikke startet</p>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-2 justify-center">
        {!stream ? (
          <Button onClick={startCamera}>
            <Camera className="mr-2 h-4 w-4" />
            Start Kamera
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={stopCamera}>
              <X className="mr-2 h-4 w-4" />
              Stopp Kamera
            </Button>
            <Button onClick={captureImage}>
              <Camera className="mr-2 h-4 w-4" />
              Ta Bilde
            </Button>
          </>
        )}
      </div>

      {preview && (
        <Card className="p-4">
          <ImagePreview
            imageData={preview}
            onAccept={handleAccept}
            onReject={() => setPreview(null)}
          />
        </Card>
      )}
    </div>
  );
}