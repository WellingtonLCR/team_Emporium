import React, { useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

export type Profile = Tables<"profiles">;

const UsersAdminPage = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Profile | null>(null);

  const profilesQuery = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const updateProfile = useMutation({
    mutationFn: async ({ id, full_name }: { id: string; full_name: string | null }) => {
      const { error } = await supabase.from("profiles").update({ full_name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Perfil atualizado");
      setEditing(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro ao atualizar perfil"),
  });

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const list = profilesQuery.data ?? [];
    if (!s) return list;
    return list.filter((p) => (p.full_name ?? "").toLowerCase().includes(s) || p.id.toLowerCase().includes(s));
  }, [profilesQuery.data, search]);

  return (
    <AdminLayout>
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <Input
          placeholder="Buscar por nome ou ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="w-48">Criado em</TableHead>
              <TableHead className="w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profilesQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>Carregando...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>Nenhum usuário encontrado</TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>{p.full_name ?? "—"}</TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleString("pt-BR")}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setEditing(p)}>
                      <Pencil className="mr-1 h-4 w-4" /> Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditUserDialog
        profile={editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSave={(full_name) => editing && updateProfile.mutate({ id: editing.id, full_name })}
        saving={updateProfile.isPending}
      />
    </div>
    </AdminLayout>
  );
};

function EditUserDialog({
  profile,
  onOpenChange,
  onSave,
  saving,
}: {
  profile: Profile | null;
  onOpenChange: (open: boolean) => void;
  onSave: (full_name: string | null) => void;
  saving?: boolean;
}) {
  const [name, setName] = useState<string>(profile?.full_name ?? "");
  React.useEffect(() => setName(profile?.full_name ?? ""), [profile]);

  return (
    <Dialog open={!!profile} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
        </DialogHeader>
        {profile ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave(name || null);
            }}
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <label htmlFor="full_name" className="text-sm font-medium">Nome</label>
              <Input id="full_name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default UsersAdminPage;
