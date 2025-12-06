
import React, { useCallback, useMemo, useState } from 'react';
import { ShoppingCart, Menu, X, Search, Smile, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCart } from '@/contexts/CartContext';
import { CartDrawer } from './CartDrawer';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export const Header = ({ onSearch }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminMobileOpen, setIsAdminMobileOpen] = useState(false);
  const { getCartItemsCount } = useCart();
  const { user, signOut, isAdmin } = useAuth();

  const displayName = useMemo(() => {
    if (!user) return '';

    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
    const candidates = [
      metadata.name,
      metadata.full_name,
      metadata.display_name,
      metadata.username,
      user.email?.split('@')[0],
    ];

    const name = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
    return typeof name === 'string' ? name.trim() : '';
  }, [user]);

  const scrollToTop = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch(searchQuery.trim());
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length === 0) {
      onSearch('');
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-40">
        {user ? (
          <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white">
            <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-sm sm:px-6 lg:px-8">
              <Smile className="h-4 w-4 flex-shrink-0 text-white/90" aria-hidden="true" />
              <span className="font-medium">
                Bem-vindo{displayName ? `, ${displayName}` : ''}!
              </span>
            </div>
          </div>
        ) : null}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              onClick={scrollToTop}
              className="flex items-center focus:outline-none"
              aria-label="Ir para a página inicial"
            >
              <h1 className="text-2xl font-bold text-green-800">
                🍃 TeaShop
              </h1>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <Input
                  type="text"
                  placeholder="Buscar chás..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-10 border-green-200 focus:border-green-400"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-800"
                  aria-label="Buscar produtos"
                >
                  <Search className="h-4 w-4" />
                </button>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" aria-hidden="true" />
              </form>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                onClick={scrollToTop}
                className="text-green-700 hover:text-green-800 font-medium"
              >
                Início
              </Link>
              <Link to="/#products" className="text-green-700 hover:text-green-800 font-medium">
                Produtos
              </Link>
              {user ? (
                <>
                  <Link to="/my-orders" className="text-green-700 hover:text-green-800 font-medium">
                    Meus pedidos
                  </Link>
                  {isAdmin ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 font-medium">
                          Admin
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to="/admin">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/categories">Categorias</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/products">Produtos</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/orders">Pedidos</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/users">Usuários</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                  <Button variant="outline" size="sm" onClick={signOut}>Sair</Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-green-700 hover:text-green-800 font-medium">
                    Entrar
                  </Link>
                  <Link to="/register" className="text-green-700 hover:text-green-800 font-medium">
                    Cadastrar
                  </Link>
                </>
              )}
            </nav>

            {/* Cart Button */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-green-700 hover:text-green-800"
              >
                <ShoppingCart className="h-6 w-6" />
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {getCartItemsCount()}
                  </span>
                )}
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-green-700"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                type="text"
                placeholder="Buscar chás..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-12 border-green-200 focus:border-green-400"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" aria-hidden="true" />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-800"
                aria-label="Buscar produtos"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link
                to="/"
                onClick={() => {
                  scrollToTop();
                  setIsMenuOpen(false);
                }}
                className="block text-green-700 hover:text-green-800 font-medium py-2"
              >
                Início
              </Link>
              <Link to="/#products" className="block text-green-700 hover:text-green-800 font-medium py-2">
                Produtos
              </Link>
              {user ? (
                <>
                  <Link to="/my-orders" className="block text-green-700 hover:text-green-800 font-medium py-2">
                    Meus pedidos
                  </Link>
                  {isAdmin ? (
                    <div className="border-t border-green-100 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAdminMobileOpen((v) => !v)}
                        className="flex w-full items-center justify-between py-2 text-green-700 hover:text-green-800 font-medium"
                        aria-expanded={isAdminMobileOpen ? 'true' : 'false'}
                        aria-haspopup="menu"
                        aria-controls="admin-mobile-menu"
                      >
                        Admin
                        <ChevronDown className={`h-4 w-4 transition-transform ${isAdminMobileOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isAdminMobileOpen && (
                        <div id="admin-mobile-menu" className="ml-2 mt-1 space-y-2">
                          <Link to="/admin" className="block text-green-700 hover:text-green-800 font-medium py-1">
                            Dashboard
                          </Link>
                          <Link to="/admin/categories" className="block text-green-700 hover:text-green-800 font-medium py-1">
                            Categorias
                          </Link>
                          <Link to="/admin/products" className="block text-green-700 hover:text-green-800 font-medium py-1">
                            Produtos
                          </Link>
                          <Link to="/admin/orders" className="block text-green-700 hover:text-green-800 font-medium py-1">
                            Pedidos
                          </Link>
                          <Link to="/admin/users" className="block text-green-700 hover:text-green-800 font-medium py-1">
                            Usuários
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : null}
                  <button onClick={signOut} className="block text-left w-full text-green-700 hover:text-green-800 font-medium py-2">
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block text-green-700 hover:text-green-800 font-medium py-2">
                    Entrar
                  </Link>
                  <Link to="/register" className="block text-green-700 hover:text-green-800 font-medium py-2">
                    Cadastrar
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
