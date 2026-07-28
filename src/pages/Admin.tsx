import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { formatPrice } from '../lib/utils';
import { Trash2, Edit } from 'lucide-react';

export function Admin() {
  const { userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState<'iPhone' | 'Samsung' | 'Laptops' | 'Phone Accessories' | 'Laptop Accessories'>('iPhone');
  const [imageUrl, setImageUrl] = useState('');
  
  useEffect(() => {
    if (!authLoading && !userProfile?.isAdmin) {
      navigate('/');
    }
  }, [userProfile, authLoading, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImageUrl(dataUrl);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProduct = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category,
        imageUrl,
        createdAt: new Date().toISOString(),
        variants: category === 'iPhone' || category === 'Samsung' ? [
          { name: 'Color', options: ['Black', 'White', 'Blue'] },
          { name: 'Storage', options: ['128GB', '256GB', '512GB'] }
        ] : category === 'Laptops' ? [
          { name: 'RAM', options: ['8GB', '16GB', '32GB'] },
          { name: 'Storage', options: ['256GB SSD', '512GB SSD', '1TB SSD'] }
        ] : []
      };

      await addDoc(collection(db, 'products'), newProduct);
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setImageUrl('');
      
      fetchProducts();
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product', error);
      alert('Failed to add product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product', error);
      }
    }
  };

  const handleExportToSheets = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive');
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      
      const result = await signInWithPopup(auth, provider);
      
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (!token) throw new Error('Failed to get access token');
      
      // Create spreadsheet
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: `Products Export - ${new Date().toLocaleDateString()}`
          }
        })
      });
      
      if (!createRes.ok) throw new Error('Failed to create spreadsheet');
      const spreadsheet = await createRes.json();
      
      // Populate data
      const values = [
        ['ID', 'Name', 'Category', 'Price', 'Stock', 'Description'],
        ...products.map(p => [
          p.id, p.name, p.category, p.price, p.stock, p.description
        ])
      ];
      
      const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet.spreadsheetId}/values/Sheet1!A1:F${values.length}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values
        })
      });
      
      if (!updateRes.ok) throw new Error('Failed to update spreadsheet');
      
      alert('Products successfully exported to Google Sheets!');
      window.open(spreadsheet.spreadsheetUrl, '_blank');
    } catch (err: any) {
      console.error('Export failed', err);
      alert('Failed to export to Google Sheets: ' + err.message);
    }
  };

  if (authLoading || loading) return <div className="p-12 text-center">Loading admin panel...</div>;
  if (!userProfile?.isAdmin) return null;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <Button onClick={handleExportToSheets} variant="outline" className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z" />
          </svg>
          Export to Sheets
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-zinc-200">
          <h2 className="text-xl font-bold mb-6">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input required value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price ($)</label>
                <Input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <Input type="number" required value={stock} onChange={e => setStock(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select 
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
                value={category}
                onChange={e => setCategory(e.target.value as any)}
              >
                <option value="iPhone">iPhone</option>
                <option value="Samsung">Samsung</option>
                <option value="Laptops">Laptops</option>
                <option value="Phone Accessories">Phone Accessories</option>
                <option value="Laptop Accessories">Laptop Accessories</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Product Image</label>
              <div className="flex gap-4 items-center">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="flex-1 cursor-pointer"
                />
                <span className="text-sm text-zinc-500">or</span>
                <Input 
                  value={imageUrl} 
                  onChange={e => setImageUrl(e.target.value)} 
                  placeholder="Paste image URL..." 
                  className="flex-1"
                />
              </div>
              {imageUrl && (
                <div className="mt-4">
                  <img src={imageUrl} alt="Preview" className="h-24 w-24 object-cover rounded-xl border border-zinc-200" />
                </div>
              )}
            </div>
            
            <Button type="submit" className="w-full mt-4">Add Product</Button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold mb-4">Manage Products</h2>
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-zinc-900">Product</th>
                  <th className="px-6 py-4 font-semibold text-zinc-900">Category</th>
                  <th className="px-6 py-4 font-semibold text-zinc-900">Price</th>
                  <th className="px-6 py-4 font-semibold text-zinc-900">Stock</th>
                  <th className="px-6 py-4 font-semibold text-zinc-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-zinc-100 overflow-hidden flex-shrink-0">
                        <img src={product.imageUrl || 'https://via.placeholder.com/40'} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <span className="truncate max-w-[200px]">{product.name}</span>
                    </td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
