import { createContext, useState, useEffect } from "react";

const CartContext = createContext();
const CART_VERSION = "v2";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    const cartVersion = localStorage.getItem("cartVersion");
    
    if (cartVersion !== CART_VERSION) {
      console.log("🔄 Clearing old cart format...");
      localStorage.removeItem("cart");
      localStorage.setItem("cartVersion", CART_VERSION);
      setCartItems([]);
      return;
    }
    
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      const validItems = parsed.filter(item => {
        if (!item.farmerId) {
          console.warn("Removing invalid cart item (missing farmerId):", item);
          return false;
        }
        return true;
      });
      setCartItems(validItems);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    console.log("=== ADD TO CART DEBUG ===");
    console.log("Product received:", product);
    console.log("product.farmerId:", product.farmerId);
    console.log("product.farmerId type:", typeof product.farmerId);
    console.log("Extracted farmerId:", product.farmerId?._id || product.farmerId);
    console.log("========================");
    
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item._id === product._id);
      
      if (existingItem) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const farmerId = product.farmerId?._id || product.farmerId;
        
        if (!farmerId) {
          console.error("❌ Cannot add product without farmerId:", product);
          alert("This product is missing farmer information. Please contact support.");
          return prev;
        }
        
        const cartItem = { 
          _id: product._id,
          name: product.name,
          variety: product.variety,
          form: product.form,
          price: product.price,
          image: product.image || product.images?.[0],
          farmerId: farmerId,
          quantity 
        };
        
        console.log("✅ Cart item to be added:", cartItem);
        
        return [...prev, cartItem];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartContext;