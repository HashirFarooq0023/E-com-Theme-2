'use client';

import { useEffect, useState } from "react";
import TopNav from "../../components/TopNav";
import WaterButton from "../../components/WaterButton";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [total, setTotal] = useState(0);

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
    if (savedUser) setUser(savedUser);
  }, []);

  function updateQuantity(id, quantity) {
    if (quantity <= 0) return removeItem(id);
    setCart((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      localStorage.setItem("cart", JSON.stringify(next));
      setTotal(
        next.reduce(
          (sum, item) => sum + Number(item.price) * Number(item.quantity || 1),
          0
        )
      );
      return next;
    });
  }

  function removeItem(id) {
    setCart((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem("cart", JSON.stringify(next));
      setTotal(
        next.reduce(
          (sum, item) => sum + Number(item.price) * Number(item.quantity || 1),
          0
        )
      );
      return next;
    });
  }

  const cartCount = cart.length;

  return (
    <div className="page">
      <TopNav cartCount={cartCount} user={user} />
      <main className="layout">
        <section className="panel cart">
          <div className="panel-header">
            <div>
              <h2>Cart</h2>
              <p>Review items before checkout.</p>
            </div>
            <span className="pill">${total.toFixed(2)}</span>
          </div>
          {cart.length === 0 ? (
            <p className="muted">
              Your cart is empty.{" "}
              <Link href="/" className="nav-link">
                Continue shopping
              </Link>
            </p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-row">
                    <div>
                      <div className="cart-title">{item.name}</div>
                      <div className="muted">
                        ${item.price} each · {item.category}
                      </div>
                    </div>
                    <div className="cart-actions">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, Number(e.target.value))
                        }
                      />
                      <WaterButton
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </WaterButton>
                    </div>
                  </div>
                ))}
              </div>
              <div className="checkout">
                <h3>Next step</h3>
                <p className="muted">
                  Proceed to checkout to enter your details and place the order.
                </p>
                <Link href="/checkout">
                  <WaterButton variant="primary" block>
                    Go to checkout
                  </WaterButton>
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}


