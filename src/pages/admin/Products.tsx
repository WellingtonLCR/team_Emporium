import React, { useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useProducts, useProductCategories } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Minus, Pencil, Trash2 } from "lucide-react";

type ProductInput = Omit<Product, "id" | "rating" | "reviews">;

const emptyProduct: ProductInput = {
  name: "",
  description: "",
  price: 0,
  image: "",
  category: "",
  stock: 0,
  weight: 0,
};

export default function ProductsAdminPage() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useProductCategories();

  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s) ||
      p.description.toLowerCase().includes(s)
    );
  }, [products, search]);

  const createMutation = useMutation({
    mutationFn: async (payload: ProductInput) => {
      const { data, error } = await supabase
        .from("products")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto criado");
      setOpenForm(false);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro ao criar")
  });

  const adjustStock = useMutation({
    mutationFn: async ({ id, delta }: { id: string; delta: number }) => {
      // tenta RPC de incremento, senão faz update direto com expressão
      try {
        const { error: rpcErr } = await supabase.rpc("increment_product_stock", { product_id: id, quantity_to_increment: delta });
        if (rpcErr) throw rpcErr;
      } catch {
        const { error } = await supabase
          .from("products")
          .update({ stock: (supabase as any).sql`GREATEST(0, stock + ${delta})` })
          .eq("id", id);
        if (error) throw error;
      }

      // registra movimentação de estoque (best-effort)
      try {
        await (supabase as any)
          .from("stock_movements")
          .insert({
            product_id: id,
            quantity: Math.abs(delta),
            type: delta >= 0 ? "in" : "out",
            reason: "manual_adjust",
          });
      } catch {}
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Estoque atualizado");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro ao atualizar estoque"),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string } & ProductInput) => {
      const { id, ...rest } = payload;
      const { data, error } = await supabase
        .from("products")
        .update(rest)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto atualizado");
      setOpenForm(false);
      setEditing(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro ao atualizar")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto removido");
      setDeleting(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro ao remover")
  });

  const handleCreate = (values: ProductInput) => createMutation.mutate(values);
  const handleUpdate = (values: { id: string } & ProductInput) => updateMutation.mutate(values);
  const handleDelete = () => {
    if (deleting) deleteMutation.mutate(deleting.id);
  };

  return (
    <AdminLayout>
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por nome, categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => { setEditing(null); setOpenForm(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Novo
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="w-24">Preço</TableHead>
              <TableHead className="w-24">Estoque</TableHead>
              <TableHead className="w-24">Peso (g)</TableHead>
              <TableHead className="w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>Carregando...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>Nenhum produto encontrado</TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>R$ {p.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => adjustStock.mutate({ id: p.id, delta: -1 })}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="min-w-[2ch] text-center">{p.stock}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => adjustStock.mutate({ id: p.id, delta: 1 })}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{p.weight}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditing(p); setOpenForm(true); }}
                      >
                        <Pencil className="mr-1 h-4 w-4" /> Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleting(p)}
                      >
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

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            categories={categories.filter(Boolean)}
            initial={editing ?? emptyProduct}
            onCancel={() => { setOpenForm(false); setEditing(null); }}
            onSubmit={(values) => {
              if (editing) {
                handleUpdate({ id: editing.id, ...values });
              } else {
                handleCreate(values);
              }
            }}
            submitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover produto</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Tem certeza que deseja remover "{deleting?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </AdminLayout>
  );
}

function ProductForm({
  categories,
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  categories: string[];
  initial: Product | ProductInput;
  onSubmit: (values: ProductInput) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const [form, setForm] = useState<ProductInput>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: Number(initial?.price ?? 0),
    image: initial?.image ?? "",
    category: initial?.category ?? (categories[0] || ""),
    stock: Number(initial?.stock ?? 0),
    weight: Number(initial?.weight ?? 0),
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (field: keyof ProductInput, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]:
        field === "price" ? Number(value)
        : field === "stock" || field === "weight" ? Number(value)
        : value,
    }));
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `prod-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("products")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("products").getPublicUrl(path);
      setForm((prev) => ({ ...prev, image: data.publicUrl }));
      toast.success("Imagem enviada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category) {
      toast.error("Informe nome e categoria");
      return;
    }
    onSubmit({ ...form });
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="price">Preço</Label>
          <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => handleChange("price", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stock">Estoque</Label>
          <Input id="stock" type="number" value={form.stock} onChange={(e) => handleChange("stock", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="weight">Peso (g)</Label>
          <Input id="weight" type="number" value={form.weight} onChange={(e) => handleChange("weight", e.target.value)} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image">URL da imagem</Label>
        <Input id="image" value={form.image} onChange={(e) => handleChange("image", e.target.value)} />
        {form.image ? (
          <img src={form.image} alt="Pré-visualização" className="mt-2 h-24 w-24 object-cover rounded border" onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none';}} />
        ) : null}
        <Input type="file" accept="image/*" onChange={(e) => e.currentTarget.files?.[0] && handleFile(e.currentTarget.files[0])} disabled={uploading} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category">Categoria</Label>
        {categories.length > 0 ? (
          <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {Array.from(new Set(categories)).map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        <Input
          id="category"
          placeholder="Ou digite uma nova categoria"
          value={form.category}
          onChange={(e) => handleChange("category", e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={submitting}>{submitting ? "Salvando..." : "Salvar"}</Button>
      </div>
    </form>
  );
}
