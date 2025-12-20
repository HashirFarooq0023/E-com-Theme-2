'use client';

import { useState } from "react";
import { SignIn, SignUp, useUser, SignOutButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import TopNav from "../../components/TopNav"; 
import WaterButton from "../../components/WaterButton";

export default function AuthPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [mode, setMode] = useState("login");

  if (!isLoaded) return null;

  // ✨ 1. Custom Clerk Styling to hide headers & blend background
  const clerkAppearance = {
    baseTheme: dark,
    layout: {
      socialButtonsPlacement: "bottom", // Moves Google button to bottom (looks cleaner)
    },
    variables: {
      colorPrimary: "#3b82f6", // Your blue accent
      colorBackground: "transparent", // 👈 MAKES IT BLEND!
      colorText: "white",
      borderRadius: "12px",
    },
    elements: {
      // Hides the "Sign in to..." text since we already have "Welcome Back"
      headerTitle: "hidden", 
      headerSubtitle: "hidden",
      // Removes the inner box shadow/border
      card: "shadow-none border-none bg-transparent", 
    }
  };

  return (
    <div className="page">
      <TopNav user={user} />
      
      <main className="auth-main">
        <section className="panel auth-panel">
          
          <div className="panel-header">
            {/* We keep YOUR custom header */}
            <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
            <p className="subtitle">
              {mode === "login" 
                ? "Enter your details to access your cart." 
                : "Sign up today for exclusive deals."}
            </p>
          </div>

          {isSignedIn ? (
            <div className="user-card">
              <div className="user-info">
                <span className="avatar-placeholder">{user.primaryEmailAddress?.emailAddress[0].toUpperCase()}</span>
                <p>{user.primaryEmailAddress?.emailAddress}</p>
              </div>
              <SignOutButton>
                <WaterButton variant="ghost" className="signout-btn">Sign out</WaterButton>
              </SignOutButton>
            </div>
          ) : (
            <div className="auth-stack">
              <div className="tabs-container">
                <button
                  className={`tab-btn ${mode === "login" ? "active" : ""}`}
                  onClick={() => setMode("login")}
                >
                  Log In
                </button>
                <button
                  className={`tab-btn ${mode === "register" ? "active" : ""}`}
                  onClick={() => setMode("register")}
                >
                  Sign Up
                </button>
              </div>

              <div className="clerk-wrapper">
                {mode === "login" ? (
                  <SignIn 
                    routing="hash" 
                    appearance={clerkAppearance} // 👈 Applied here
                  /> 
                ) : (
                  <SignUp 
                    routing="hash"
                    appearance={clerkAppearance} // 👈 Applied here
                  />
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}