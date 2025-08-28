import apiService from './apiService';

class CartService {
  // Get cart items from localStorage (client-side cart)
  getCartItems() {
    try {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error getting cart items:', error);
      return [];
    }
  }

  // Add item to cart
  addToCart(product, quantity = 1) {
    try {
      const cart = this.getCartItems();
      const existingItem = cart.find(item => item.productId === product._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          productId: product._id,
          name: product.productTypeId?.name || product.name,
          price: product.price,
          image: product.images?.[0] || null,
          brand: product.productTypeId?.brandId?.name,
          category: product.productTypeId?.categoryId?.displayName,
          condition: product.condition,
          stock: product.stock,
          quantity: quantity,
          addedAt: new Date().toISOString()
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      return { success: true, cart };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove item from cart
  removeFromCart(productId) {
    try {
      const cart = this.getCartItems();
      const updatedCart = cart.filter(item => item.productId !== productId);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return { success: true, cart: updatedCart };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: error.message };
    }
  }

  // Update item quantity
  updateQuantity(productId, quantity) {
    try {
      const cart = this.getCartItems();
      const item = cart.find(item => item.productId === productId);
      
      if (item) {
        if (quantity <= 0) {
          return this.removeFromCart(productId);
        }
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        return { success: true, cart };
      }
      
      return { success: false, error: 'Item not found in cart' };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear cart
  clearCart() {
    try {
      localStorage.removeItem('cart');
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: error.message };
    }
  }

  // Get cart total
  getCartTotal() {
    try {
      const cart = this.getCartItems();
      return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    } catch (error) {
      console.error('Error calculating cart total:', error);
      return 0;
    }
  }

  // Get cart item count
  getCartItemCount() {
    try {
      const cart = this.getCartItems();
      return cart.reduce((count, item) => count + item.quantity, 0);
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0;
    }
  }

  // Checkout - create order
  async checkout(orderData, token) {
    try {
      // For now, we'll create individual orders for each cart item
      // In a real app, you might want to batch these or create a single order
      const cart = this.getCartItems();
      
      if (cart.length === 0) {
        throw new Error('Cart is empty');
      }

      const orders = [];
      
      for (const item of cart) {
        const orderPayload = {
          productId: item.productId,
          quantity: item.quantity,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod
        };
        
        const response = await apiService.post(`/orders/buyer/product/${item.productId}`, orderPayload, token);
        if (response.success) {
          orders.push(response.order);
        }
      }
      
      // Clear cart after successful checkout
      if (orders.length > 0) {
        this.clearCart();
      }
      
      return { success: true, orders };
    } catch (error) {
      console.error('Error during checkout:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new CartService();
