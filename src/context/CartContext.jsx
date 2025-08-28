import React, { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Update totals when cart items change
  useEffect(() => {
    setCartTotal(cartService.getCartTotal());
    setCartItemCount(cartService.getCartItemCount());
  }, [cartItems]);

  const loadCart = () => {
    const items = cartService.getCartItems();
    setCartItems(items);
  };

  const addToCart = (product, quantity = 1) => {
    const result = cartService.addToCart(product, quantity);
    if (result.success) {
      setCartItems(result.cart);
      return { success: true };
    }
    return result;
  };

  const removeFromCart = (productId) => {
    const result = cartService.removeFromCart(productId);
    if (result.success) {
      setCartItems(result.cart);
      return { success: true };
    }
    return result;
  };

  const updateQuantity = (productId, quantity) => {
    const result = cartService.updateQuantity(productId, quantity);
    if (result.success) {
      setCartItems(result.cart);
      return { success: true };
    }
    return result;
  };

  const clearCart = () => {
    const result = cartService.clearCart();
    if (result.success) {
      setCartItems([]);
      return { success: true };
    }
    return result;
  };

  const checkout = async (orderData, token) => {
    const result = await cartService.checkout(orderData, token);
    if (result.success) {
      setCartItems([]);
    }
    return result;
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.productId === productId);
  };

  const getCartItem = (productId) => {
    return cartItems.find(item => item.productId === productId);
  };

  const value = {
    cartItems,
    cartTotal,
    cartItemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkout,
    isInCart,
    getCartItem,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
