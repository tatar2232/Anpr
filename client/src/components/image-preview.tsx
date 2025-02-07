import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface Props {
  imageData: string;
  onAccept: () => void;
  onReject: () => void;
}

export default function ImagePreview({ imageData, onAccept, onReject }: Props) {
  return (
    <div className="space-y-4">
      <div className="aspect-video relative rounded-lg overflow-hidden">
        <img
          src={imageData}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex justify-center gap-2">
        <Button variant="destructive" onClick={onReject}>
          <X className="mr-2 h-4 w-4" />
          Reject
        </Button>
        <Button onClick={onAccept}>
          <Check className="mr-2 h-4 w-4" />
          Accept
        </Button>
      </div>
    </div>
  );
}
