import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Cart } from '../types';
import { fetchCart, addCartItem, updateCartItemQuantity, removeCartItem, clearServerCart } from '../api/cart';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: (silent?: boolean) => Promise<void>;
}

const emptyCart: Cart = {
  items: [],
  total_count: 0,
  subtotal: 0,
  shipping_fee: 0,
  total: 0,
};

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const isFetchingRef = useRef<boolean>(false);

  const refreshCart = useCallback(
    async (silent: boolean = false) => {
      if (!user) {
        setCart(emptyCart);
        return;
      }
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (!silent) {
        setIsSyncing(true);
      }

      try {
        const remoteCart = await fetchCart();
        if (isMountedRef.current) {
          setCart(remoteCart);
          setLastSyncedAt(new Date());
        }
      } catch (err) {
        console.warn('Failed to refresh cart:', err);
      } finally {
        isFetchingRef.current = false;
        if (isMountedRef.current) {
          setIsSyncing(false);
          setIsLoading(false);
        }
      }
    },
    [user]
  );

  // Initial fetch when user logs in or changes
  useEffect(() => {
    isMountedRef.current = true;
    if (user) {
      setIsLoading(true);
      refreshCart(false);
    } else {
      setCart(emptyCart);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [user, refreshCart]);

  // Real-time synchronization polling (every 2 seconds) when user is logged in
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshCart(true); // silent background poll
    }, 2000);

    return () => clearInterval(interval);
  }, [user, refreshCart]);

  // Re-sync immediately when app comes into foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && user) {
        refreshCart(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [user, refreshCart]);

  const addToCart = async (productId: number, quantity: number = 1): Promise<void> => {
    setIsSyncing(true);
    try {
      const updated = await addCartItem(productId, quantity);
      setCart(updated);
      setLastSyncedAt(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  const updateQuantity = async (productId: number, quantity: number): Promise<void> => {
    setIsSyncing(true);
    try {
      if (quantity <= 0) {
        const updated = await removeCartItem(productId);
        setCart(updated);
      } else {
        const updated = await updateCartItemQuantity(productId, quantity);
        setCart(updated);
      }
      setLastSyncedAt(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  const removeFromCart = async (productId: number): Promise<void> => {
    setIsSyncing(true);
    try {
      const updated = await removeCartItem(productId);
      setCart(updated);
      setLastSyncedAt(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  const clearCart = async (): Promise<void> => {
    setIsSyncing(true);
    try {
      const updated = await clearServerCart();
      setCart(updated);
      setLastSyncedAt(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isSyncing,
        lastSyncedAt,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
