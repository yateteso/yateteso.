import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Trash2, ArrowRight } from 'lucide-react';

export function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [productsCache, setProductsCache] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    contact: ''
  });

  useEffect(() => {
    if (currentUser && !formData.email) {
      setFormData(prev => ({
        ...prev,
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchCartProducts = async () => {
      setLoading(true);
      const cache: Record<string, Product> = { ...productsCache };
      let updated = false;

      for (const item of cart) {
        if (!cache[item.productId]) {
          try {
            const docRef = doc(db, 'products', item.productId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              cache[item.productId] = { id: docSnap.id, ...docSnap.data() } as Product;
              updated = true;
            }
          } catch (e) {
            console.error('Error fetching product for cart', e);
          }
        }
      }

      if (updated) {
        setProductsCache(cache);
      }
      setLoading(false);
    };

    fetchCartProducts();
  }, [cart]);

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const product = productsCache[item.productId];
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address || !formData.city || !formData.zipCode || !formData.contact) {
      alert('Please fill in all checkout fields.');
      return;
    }

    setCheckingOut(true);
    try {
      const subtotal = calculateSubtotal();
      const tax = subtotal * 0.08;
      const totalAmount = subtotal + tax;
      
      const orderItems = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: productsCache[item.productId]?.price || 0,
        selectedVariants: item.selectedVariants
      }));

      // Submit to Firebase
      await addDoc(collection(db, 'orders'), {
        userId: currentUser.uid,
        items: orderItems,
        totalAmount,
        status: 'Pending',
        createdAt: new Date().toISOString()
      });

      // Submit to Google Apps Script
      const productNames = cart.map(item => {
        const product = productsCache[item.productId];
        return product ? `${product.name} (x${item.quantity})` : 'Unknown Product';
      }).join(', ');

      const payload = {
        'First Name': formData.firstName,
        'Last Name': formData.lastName,
        'Email': formData.email,
        'Street Address': formData.address,
        'City': formData.city,
        'ZIP Code': formData.zipCode,
        'Product Name': productNames,
        'Total Amount': formatPrice(totalAmount),
        'Date & Time': new Date().toLocaleString(),
        'Contact': formData.contact,
      };

      const formBody = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        formBody.append(key, value);
      });

      await fetch('https://script.google.com/macros/s/AKfycbyvY8XyQYeRu-zIxHSxkGd4xY3l5bjvwWYZ_qyd-NcpMbvHQ51KgJezingGUPIbjXSU/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString()
      });

      clearCart();
      alert('Order placed successfully!');
      navigate('/');
    } catch (error) {
      console.error('Checkout error', error);
      alert('Failed to place order.');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading && cart.length > 0 && Object.keys(productsCache).length === 0) {
    return <div className="container mx-auto px-4 py-24 text-center">Loading cart...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Your cart is empty</h1>
        <p className="text-zinc-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.08; // 8% dummy tax
  const total = subtotal + tax;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items and Form */}
        <div className="flex-1 space-y-8">
          <div className="space-y-6">
            {cart.map((item, index) => {
              const product = productsCache[item.productId];
              if (!product) return null;

              return (
                <div key={index} className="flex flex-col sm:flex-row gap-6 p-6 bg-white rounded-2xl border border-zinc-200">
                  <div className="w-full sm:w-32 h-32 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=200'} 
                      alt={product.name} 
                      className="w-full h-full object-cover mix-blend-multiply"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg"><Link to={`/products/${product.id}`} className="hover:underline">{product.name}</Link></h3>
                        <span className="font-bold">{formatPrice(product.price)}</span>
                      </div>
                      
                      <div className="text-sm text-zinc-500 space-y-1 mb-4">
                        {Object.entries(item.selectedVariants).map(([key, value]) => (
                          <p key={key}>{key}: {value}</p>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.selectedVariants, item.quantity - 1)}
                          className="px-3 py-1.5 text-zinc-500 hover:text-black transition-colors"
                        >-</button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.selectedVariants, item.quantity + 1)}
                          className="px-3 py-1.5 text-zinc-500 hover:text-black transition-colors"
                        >+</button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.productId, item.selectedVariants)}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Information Form */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-zinc-200">
            <h2 className="text-xl font-bold mb-6">Delivery Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">First Name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">Contact Number</label>
                <input 
                  type="tel" 
                  name="contact" 
                  value={formData.contact} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">Address</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Zip Code</label>
                <input 
                  type="text" 
                  name="zipCode" 
                  value={formData.zipCode} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-200 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Estimated Tax</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
            </div>
            
            <div className="border-t border-zinc-200 pt-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl">{formatPrice(total)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full h-12 text-base font-bold shadow-lg shadow-black/10 transition-all hover:shadow-black/20"
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? 'Processing...' : currentUser ? 'Submit Checkout' : 'Login to Checkout'}
              {!checkingOut && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

