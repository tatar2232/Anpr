import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import type { Capture } from "@shared/schema";

interface Props {
  captures: Capture[];
  isLoading: boolean;
}

export default function CaptureHistory({ captures, isLoading }: Props) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (deleteId === null) return;

    try {
      await apiRequest("DELETE", `/api/captures/${deleteId}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/captures"] });
      toast({
        title: "Success",
        description: "Capture deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete capture",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Plate Number</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {captures.map((capture) => (
              <TableRow key={capture.id}>
                <TableCell>
                  <div className="w-24 h-16 relative rounded overflow-hidden">
                    <img
                      src={capture.imageData}
                      alt="Capture"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(capture.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{capture.plateNumber || "Pending"}</TableCell>
                <TableCell>{capture.confidence || "N/A"}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setDeleteId(capture.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {captures.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No captures yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Capture</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this capture? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
