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
        title: "Suksess",
        description: "Registreringsnummer lagt til i overvåkningslisten",
      });
    } catch (error: any) {
      toast({
        title: "Feil",
        description: error.message || "Kunne ikke legge til registreringsnummer",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/watched-plates/${id}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/watched-plates"] });
      toast({
        title: "Suksess",
        description: "Registreringsnummer fjernet fra overvåkningslisten",
      });
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke fjerne registreringsnummer",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Skriv inn registreringsnummer"
            value={newPlate}
            onChange={(e) => setNewPlate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="Beskrivelse (valgfritt)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button onClick={handleAdd}>Legg til i overvåkningsliste</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registreringsnummer</TableHead>
              <TableHead>Beskrivelse</TableHead>
              <TableHead>Lagt til</TableHead>
              <TableHead className="w-[100px]">Handlinger</TableHead>
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
                  Ingen registreringsnumre i overvåkningslisten
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