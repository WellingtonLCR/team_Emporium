import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Package, Tags, Users2, ShoppingCart } from "lucide-react";

const NavLink = ({ to, label }: { to: string; label: React.ReactNode }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={[
        "px-3 py-2 rounded-md text-sm font-medium",
        active ? "bg-green-100 text-green-800" : "text-slate-700 hover:bg-slate-100"
      ].join(" ")}
    >
      {label}
    </Link>
  );
};

const AdminHeader: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-lg font-semibold text-green-700">Admin</Link>
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/admin" label={<span className="inline-flex items-center gap-1"><LayoutDashboard className="h-4 w-4" /> Dashboard</span>} />
            <NavLink to="/admin/products" label={<span className="inline-flex items-center gap-1"><Package className="h-4 w-4" /> Produtos</span>} />
            <NavLink to="/admin/orders" label={<span className="inline-flex items-center gap-1"><ShoppingCart className="h-4 w-4" /> Pedidos</span>} />
            <NavLink to="/admin/categories" label={<span className="inline-flex items-center gap-1"><Tags className="h-4 w-4" /> Categorias</span>} />
            <NavLink to="/admin/users" label={<span className="inline-flex items-center gap-1"><Users2 className="h-4 w-4" /> Usuários</span>} />
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">Ver loja</Link>
          {user ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>Sair</Button>
          ) : (
            <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900">Entrar</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
