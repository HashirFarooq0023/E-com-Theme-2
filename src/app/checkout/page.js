'use client';

import { useEffect, useState } from "react";
import TopNav from "../../components/TopNav";
import WaterButton from "../../components/WaterButton";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [total, setTotal] = useState(0);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
    setTotal(
      savedCart.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity || 1),
        0
      )
    );
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (savedUser) {
      setUser(savedUser);
      setCustomer((prev) => ({
        ...prev,
        name: savedUser.name || prev.name,
        email: savedUser.email || prev.email,
      }));
    }
  }, []);

  async function placeOrder() {
    if (!cart.length) {
      setOrderStatus({ type: "error", message: "Your cart is empty." });
      return;
    }
    setLoading(true);
    setOrderStatus(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, customer }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to place order");
      }
      setOrderStatus({
        type: "success",
        message: `Order ${data.orderId} placed. Total $${data.total.toFixed(
          2
        )}`,
      });
      setCart([]);
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify([]));
      }
      setTotal(0);
    } catch (error) {
      setOrderStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  const cartCount = cart.length;

  return (
    <div className="page">
      <TopNav cartCount={cartCount} user={user} />
      <main className="layout">
        <section className="panel cart">
          <div className="panel-header">
            <div>
              <h2>Checkout</h2>
              <p>Enter your details to complete the order.</p>
            </div>
            <span className="pill">${total.toFixed(2)}</span>
          </div>
          {cart.length === 0 ? (
            <p className="muted">No items to checkout.</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-row">
                    <div>
                      <div className="cart-title">{item.name}</div>
                      <div className="muted">
                        {item.quantity} × ${item.price}
                      </div>
                    </div>
                    <div className="muted">
                      ${(Number(item.price) * Number(item.quantity || 1)).toFixed(
                        2
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="checkout">
                <h3>Customer details</h3>
                <div className="form-grid">
                  <label>
                    Name
                    <input
                      value={customer.name}
                      onChange={(e) =>
                        setCustomer((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Jane Doe"
                    />
                  </label>
                  <label>
                    Email
                    <input
                      value={customer.email}
                      onChange={(e) =>
                        setCustomer((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="jane@example.com"
                    />
                  </label>
                  <label className="full">
                    Shipping Address
                    <input
                      value={customer.address}
                      onChange={(e) =>
                        setCustomer((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      placeholder="123 Main St"
                    />
                  </label>
                </div>
                <WaterButton
                  variant="primary"
                  block
                  onClick={placeOrder}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Place order"}
                </WaterButton>
                {orderStatus && (
                  <div
                    className={`alert ${
                      orderStatus.type === "success" ? "success" : "error"
                    }`}
                  >
                    {orderStatus.message}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}


