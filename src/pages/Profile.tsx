import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../types';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export function Profile() {
  const { userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !userProfile) {
      navigate('/login');
    }
  }, [userProfile, authLoading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userProfile) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', userProfile.uid),
          // orderBy('createdAt', 'desc') // Need index for this, avoiding for simplicity
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        
        // Manual sort since we don't have composite index
        ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userProfile]);

  if (authLoading || loading) return <div className="p-12 text-center">Loading profile...</div>;
  if (!userProfile) return null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="bg-white rounded-3xl p-8 border border-zinc-200 mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Profile</h1>
        <p className="text-zinc-500 mb-8">Manage your account and view order history.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-2">Account Details</h3>
            <p className="font-medium text-lg mb-1">{userProfile.displayName}</p>
            <p className="text-zinc-600 mb-4">{userProfile.email}</p>
            <p className="text-sm text-zinc-400">Member since {new Date(userProfile.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
             <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">Quick Actions</h3>
             <div className="space-y-3">
               <Button variant="outline" className="w-full justify-start">Edit Profile</Button>
               <Button variant="outline" className="w-full justify-start">Change Password</Button>
             </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-6">Order History</h2>
      {orders.length === 0 ? (
        <div className="bg-zinc-50 rounded-2xl p-8 text-center border border-zinc-200">
          <p className="text-zinc-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-zinc-100">
                <div>
                  <p className="text-sm text-zinc-500">Order #{order.id}</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="mt-2 md:mt-0 flex items-center gap-4">
                  <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold uppercase tracking-wider">
                    {order.status}
                  </span>
                  <span className="font-bold text-lg">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="font-medium">
                      {item.quantity}x Product
                      <span className="text-zinc-500 font-normal ml-2">
                         ({Object.values(item.selectedVariants).join(', ')})
                      </span>
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
