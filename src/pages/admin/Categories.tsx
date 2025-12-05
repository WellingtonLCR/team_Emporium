import React, { useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

type CategoryStat = { name: string; count: number };

const CategoriesAdminPage = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [renaming, setRenaming] = useState<CategoryStat | null>(null);
  const [deleting, setDeleting] = useState<CategoryStat | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async (): Promise<CategoryStat[]> => {
      const { data, error } = await supabase.from("products").select("category");
      if (error) throw error;
      const map = new Map<string, number>();
      (data ?? []).forEach((r: { category: string }) => {
        const key = r.category || "Sem categoria";
        map.set(key, (map.get(key) ?? 0) + 1);
      });
      return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ from, to }: { from: string; to: string }) => {
      if (!to || from === to) return;
      const { error } = await supabase.from("products").update({ category: to }).eq("category", from);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product-categories"] });
      toast.success("Categoria atualizada");
      setRenaming(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro ao atualizar categoria"),
  });

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const cats = categoriesQuery.data ?? [];
    if (!s) return cats;
    return cats.filter((c) => c.name.toLowerCase().includes(s));
  }, [categoriesQuery.data, search]);

  const [renameTarget, setRenameTarget] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<string>("");
  const allNames = useMemo(() => (categoriesQuery.data ?? []).map((c) => c.name), [categoriesQuery.data]);

  return (
    <AdminLayout>
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Input
          placeholder="Buscar categorias"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead className="w-24">Produtos</TableHead>
              <TableHead className="w-40">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoriesQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={3}>Carregando...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>Nenhuma categoria encontrada</TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.name}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.count}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setRenaming(c); setRenameTarget(c.name); }}>
                        <Pencil className="mr-1 h-4 w-4" /> Renomear/mesclar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => { setDeleting(c); setDeleteTarget(""); }}>
                        <Trash2 className="mr-1 h-4 w-4" /> Remover
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!renaming} onOpenChange={(open) => !open && setRenaming(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Renomear/Mesclar categoria</DialogTitle>
          </DialogHeader>
          {renaming ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Categoria atual</Label>
                <Input value={renaming.name} readOnly />
              </div>
              <div className="grid gap-2">
                <Label>Novo nome (ou selecione existente para mesclar)</Label>
                <Input value={renameTarget} onChange={(e) => setRenameTarget(e.target.value)} placeholder="Novo nome" />
                {allNames.length > 0 ? (
                  <Select value={renameTarget} onValueChange={(v) => setRenameTarget(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione categoria existente" />
                    </SelectTrigger>
                    <SelectContent>
                      {allNames.filter((n) => n !== renaming.name).map((n) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRenaming(null)}>Cancelar</Button>
                <Button onClick={() => renameMutation.mutate({ from: renaming.name, to: renameTarget })} disabled={!renameTarget || renameMutation.isPending}>
                  {renameMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione uma categoria de destino para reatribuir os produtos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleting ? (
            <div className="grid gap-3">
              <Select value={deleteTarget} onValueChange={setDeleteTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria destino" />
                </SelectTrigger>
                <SelectContent>
                  {allNames.filter((n) => n !== deleting.name).map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteTarget && renameMutation.mutate({ from: deleting.name, to: deleteTarget })} disabled={!deleteTarget || renameMutation.isPending}>
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          ) : null}
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </AdminLayout>
  );
};

export default CategoriesAdminPage;
