import React, { createContext, useContext, useReducer } from 'react';

// Estado inicial del carrito
const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

// Acciones del carrito
const cartActions = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
};

// Reducer del carrito
const cartReducer = (state, action) => {
  switch (action.type) {
    case cartActions.ADD_ITEM: {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        // Si el producto ya existe, actualizar cantidad
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + 1,
          totalAmount: state.totalAmount + parseFloat(action.payload.price),
        };
      } else {
        // Si es un producto nuevo, agregarlo
        const newItem = {
          ...action.payload,
          quantity: 1,
        };
        
        return {
          ...state,
          items: [...state.items, newItem],
          totalItems: state.totalItems + 1,
          totalAmount: state.totalAmount + parseFloat(action.payload.price),
        };
      }
    }

    case cartActions.REMOVE_ITEM: {
      const itemToRemove = state.items.find(item => item.id === action.payload);
      if (!itemToRemove) return state;

      const updatedItems = state.items.filter(item => item.id !== action.payload);
      
      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems - itemToRemove.quantity,
        totalAmount: state.totalAmount - (parseFloat(itemToRemove.price) * itemToRemove.quantity),
      };
    }

    case cartActions.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === productId);
      
      if (!existingItem) return state;

      if (quantity <= 0) {
        // Si la cantidad es 0 o menor, remover el item
        return cartReducer(state, { type: cartActions.REMOVE_ITEM, payload: productId });
      }

      const quantityDifference = quantity - existingItem.quantity;
      const updatedItems = state.items.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      );

      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems + quantityDifference,
        totalAmount: state.totalAmount + (parseFloat(existingItem.price) * quantityDifference),
      };
    }

    case cartActions.CLEAR_CART:
      return initialState;

    default:
      return state;
  }
};

// Context
const CartContext = createContext();

// Hook personalizado para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

// Provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Agregar producto al carrito
  const addToCart = (product) => {
    dispatch({
      type: cartActions.ADD_ITEM,
      payload: product,
    });
  };

  // Remover producto del carrito
  const removeFromCart = (productId) => {
    dispatch({
      type: cartActions.REMOVE_ITEM,
      payload: productId,
    });
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: cartActions.UPDATE_QUANTITY,
      payload: { productId, quantity },
    });
  };

  // Limpiar carrito
  const clearCart = () => {
    dispatch({ type: cartActions.CLEAR_CART });
  };

  // Obtener cantidad de un producto específico en el carrito
  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Convertir items del carrito al formato requerido por la API
  const getCartForAPI = () => {
    return {
      items: state.items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    getCartForAPI,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};