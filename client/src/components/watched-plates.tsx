import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import type { WatchedPlate } from "@shared/schema";

interface Props {
  plates: WatchedPlate[];
  isLoading: boolean;
}

export default function WatchedPlates({ plates, isLoading }: Props) {
  const [newPlate, setNewPlate] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!newPlate.trim()) return;

    try {
      await apiRequest("POST", "/api/watched-plates", {
        plateNumber: newPlate.trim().toUpperCase(),
        description: description.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/watched-plates"] });
      setNewPlate("");
      setDescription("");
      toast({
        title: "Success",
        description: "Plate number added to watch list",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add plate number",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/watched-plates/${id}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/watched-plates"] });
      toast({
        title: "Success",
        description: "Plate number removed from watch list",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove plate number",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Enter plate number"
            value={newPlate}
            onChange={(e) => setNewPlate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button onClick={handleAdd}>Add to Watch List</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plate Number</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : plates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No plates in watch list
                </TableCell>
              </TableRow>
            ) : (
              plates.map((plate) => (
                <TableRow key={plate.id}>
                  <TableCell className="font-medium">
                    {plate.plateNumber}
                  </TableCell>
                  <TableCell>{plate.description || "—"}</TableCell>
                  <TableCell>
                    {new Date(plate.addedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(plate.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
