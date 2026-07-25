import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const initialSearchQuery = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  useEffect(() => {
    // Also update searchQuery if the URL 'q' changes directly
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams.get('q')]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = collection(db, 'products');
        if (categoryFilter) {
          q = query(q, where('category', '==', categoryFilter)) as any;
        }
        
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter]);

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.price <= priceRange;
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0; // Default
    });

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 space-y-8 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold mb-4">Search & Sort</h3>
            <div className="space-y-4">
              <Input 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select 
                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="default">Sort by: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Categories</h3>
            <div className="space-y-2">
              <Button 
                variant={!categoryFilter ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setSearchParams({})}
              >
                All Products
              </Button>
              <Button 
                variant={categoryFilter === 'Phones' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setSearchParams({ category: 'Phones' })}
              >
                Phones
              </Button>
              <Button 
                variant={categoryFilter === 'Laptops' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setSearchParams({ category: 'Laptops' })}
              >
                Laptops
              </Button>
              <Button 
                variant={categoryFilter === 'Phone Accessories' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setSearchParams({ category: 'Phone Accessories' })}
              >
                Phone Accessories
              </Button>
              <Button 
                variant={categoryFilter === 'Laptop Accessories' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setSearchParams({ category: 'Laptop Accessories' })}
              >
                Laptop Accessories
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Price Range</h3>
            <div className="space-y-4">
              <input 
                type="range" 
                min="0" 
                max="5000" 
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-black"
              />
              <div className="flex justify-between text-sm text-zinc-500">
                <span>$0</span>
                <span>{formatPrice(priceRange)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-8">
            {categoryFilter ? categoryFilter : 'All Products'}
          </h1>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-zinc-100 rounded-2xl h-80"></div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <Link key={product.id} to={`/products/${product.id}`} className="group relative bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-square bg-zinc-100 relative overflow-hidden">
                    <img 
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=400'} 
                      alt={product.name} 
                      className="absolute inset-0 w-full h-full object-cover p-8 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-1 truncate">{product.name}</h3>
                    <p className="text-sm text-zinc-500 mb-4 truncate">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-zinc-500">
              <p>No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
