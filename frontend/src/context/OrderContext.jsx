import { createContext, useState } from "react";

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [checkoutData, setCheckoutData] = useState({
    name: "",
    email: "",
    address: "",
    county: "",
    payment: "mpesa",
  });

  const [orderItems, setOrderItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [routeInfo, setRouteInfo] = useState(null);
  const [createdOrders, setCreatedOrders] = useState([]);

  const updateShippingInfo = (info) => {
    setCheckoutData((prev) => ({ ...prev, ...info }));
  };

  const updatePaymentMethod = (method) => {
    setCheckoutData((prev) => ({ ...prev, payment: method }));
  };

  const setOrderItemsData = (items, total) => {
    setOrderItems(items);
    setTotalAmount(total);
  };

  const updateRouteInfo = (route) => {
    setRouteInfo(route);
  };

  const setCreatedOrdersList = (orderIds) => {
    setCreatedOrders(orderIds);
  };

  const clearOrder = () => {
    setCheckoutData({
      name: "",
      email: "",
      address: "",
      county: "",
      payment: "mpesa",
    });
    setOrderItems([]);
    setTotalAmount(0);
    setRouteInfo(null);
    setCreatedOrders([]);
  };

  return (
    <OrderContext.Provider
      value={{
        checkoutData,
        orderItems,
        totalAmount,
        routeInfo,
        createdOrders,
        updateShippingInfo,
        updatePaymentMethod,
        setOrderItems: setOrderItemsData,
        setCreatedOrders: setCreatedOrdersList,
        updateRouteInfo,
        clearOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export default OrderContext;