import React, { createContext, useContext, useReducer, useEffect } from 'react';

const OrderContext = createContext();

// Order status constants
export const ORDER_STATUS = {
  pending: 'pending',
  processing: 'processing',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled'
};

// Initial state
const initialState = {
  orders: [],
  loading: false,
  error: null
};

// Action types
const ORDER_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_ORDER: 'ADD_ORDER',
  UPDATE_ORDER: 'UPDATE_ORDER',
  SET_ORDERS: 'SET_ORDERS',
  CLEAR_ORDERS: 'CLEAR_ORDERS'
};

// Reducer
const orderReducer = (state, action) => {
  switch (action.type) {
    case ORDER_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ORDER_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ORDER_ACTIONS.ADD_ORDER:
      return { 
        ...state, 
        orders: [...state.orders, action.payload],
        error: null 
      };
    case ORDER_ACTIONS.UPDATE_ORDER:
      return {
        ...state,
        orders: state.orders.map(order => 
          order._id === action.payload._id ? action.payload : order
        ),
        error: null
      };
    case ORDER_ACTIONS.SET_ORDERS:
      return { ...state, orders: action.payload, error: null };
    case ORDER_ACTIONS.CLEAR_ORDERS:
      return { ...state, orders: [], error: null };
    default:
      return state;
  }
};

// Provider component
export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('tech-xchange-orders');
    if (savedOrders) {
      try {
        const orders = JSON.parse(savedOrders);
        dispatch({ type: ORDER_ACTIONS.SET_ORDERS, payload: orders });
      } catch (error) {
        console.error('Error loading orders from localStorage:', error);
      }
    }
  }, []);

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem('tech-xchange-orders', JSON.stringify(state.orders));
  }, [state.orders]);

  // Actions
  const addOrder = (order) => {
    dispatch({ type: ORDER_ACTIONS.ADD_ORDER, payload: order });
  };

  const updateOrder = (orderId, updates) => {
    const order = state.orders.find(o => o._id === orderId);
    if (order) {
      const updatedOrder = { ...order, ...updates };
      dispatch({ type: ORDER_ACTIONS.UPDATE_ORDER, payload: updatedOrder });
    }
  };

  const getOrders = (userId, userRole) => {
    if (userRole === 'buyer') {
      return state.orders.filter(order => order.buyerId === userId);
    } else if (userRole === 'seller') {
      return state.orders.filter(order => order.sellerId === userId);
    }
    return state.orders;
  };

  const getOrderById = (orderId) => {
    return state.orders.find(order => order._id === orderId);
  };

  const clearOrders = () => {
    dispatch({ type: ORDER_ACTIONS.CLEAR_ORDERS });
  };

  const value = {
    ...state,
    addOrder,
    updateOrder,
    getOrders,
    getOrderById,
    clearOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// Hook
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
