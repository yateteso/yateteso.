import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CartItem } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, selectedVariants: Record<string, string>) => void;
  updateQuantity: (productId: string, selectedVariants: Record<string, string>, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (currentUser) {
      const cartRef = doc(db, 'carts', currentUser.uid);
      const unsubscribe = onSnapshot(cartRef, (doc) => {
        if (doc.exists()) {
          setCart(doc.data().items || []);
        } else {
          setCart([]);
        }
      });
      return unsubscribe;
    } else {
      // Local storage fallback for unauthenticated users
      const localCart = localStorage.getItem('yateteso_cart');
      if (localCart) {
        try {
          setCart(JSON.parse(localCart));
        } catch (e) {
          console.error(e);
        }
      } else {
        setCart([]);
      }
    }
  }, [currentUser]);

  const saveCart = async (newCart: CartItem[]) => {
    setCart(newCart);
    if (currentUser) {
      const cartRef = doc(db, 'carts', currentUser.uid);
      await setDoc(cartRef, { items: newCart });
    } else {
      localStorage.setItem('yateteso_cart', JSON.stringify(newCart));
    }
  };

  const addToCart = (newItem: CartItem) => {
    const newCart = [...cart];
    const existingIndex = newCart.findIndex(
      (item) => item.productId === newItem.productId && 
      JSON.stringify(item.selectedVariants) === JSON.stringify(newItem.selectedVariants)
    );

    if (existingIndex >= 0) {
      newCart[existingIndex].quantity += newItem.quantity;
    } else {
      newCart.push(newItem);
    }
    saveCart(newCart);
  };

  const removeFromCart = (productId: string, selectedVariants: Record<string, string>) => {
    const newCart = cart.filter(
      (item) => !(item.productId === productId && JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants))
    );
    saveCart(newCart);
  };

  const updateQuantity = (productId: string, selectedVariants: Record<string, string>, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedVariants);
      return;
    }
    const newCart = [...cart];
    const existingIndex = newCart.findIndex(
      (item) => item.productId === productId && 
      JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
    );
    if (existingIndex >= 0) {
      newCart[existingIndex].quantity = quantity;
      saveCart(newCart);
    }
  };

  const clearCart = () => {
    saveCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
