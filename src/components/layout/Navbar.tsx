import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { auth } from '../../lib/firebase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function Navbar() {
  const { currentUser, userProfile } = useAuth();
  const { cart } = useCart();
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold tracking-tighter">
              yateteso.
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
              <Link to="/products?category=Phones" className="hover:text-zinc-900 transition-colors">Phones</Link>
              <Link to="/products?category=Laptops" className="hover:text-zinc-900 transition-colors">Laptops</Link>
              <Link to="/products?category=Phone Accessories" className="hover:text-zinc-900 transition-colors">Phone Accessories</Link>
              <Link to="/products?category=Laptop Accessories" className="hover:text-zinc-900 transition-colors">Laptop Accessories</Link>
              <Link to="/contact" className="hover:text-zinc-900 transition-colors">Contact</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden sm:flex relative items-center">
              <Search className="absolute left-3 h-4 w-4 text-zinc-400" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-9 w-48 lg:w-64 h-9 rounded-full bg-zinc-100 border-transparent focus-visible:ring-black focus-visible:bg-white transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            
            <Link to="/cart" className="relative text-zinc-600 hover:text-zinc-900 transition-colors ml-2">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            
            {currentUser ? (
              <div className="flex items-center gap-4 ml-2">
                <Link to="/profile" className="text-sm font-medium hover:underline hidden sm:block">
                  {userProfile?.displayName}
                </Link>
                {userProfile?.isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="hidden md:flex">Admin</Button>
                  </Link>
                )}
                <button onClick={handleLogout} className="text-zinc-600 hover:text-zinc-900 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}
            
            <button className="md:hidden text-zinc-600 hover:text-zinc-900 ml-2">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
