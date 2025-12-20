

export const ROLE_NAVIGATION = {
    //  ADMIN SCREENS
    admin: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutGrid" },
      { label: "Inventory", href: "/admin/products", icon: "Package" },
      { label: "Add Product", href: "/admin/addproducts", icon: "PlusCircle" },
      { label: "Orders", href: "/admin/orders", icon: "List" },
      { label: "Customers", href: "/admin/customers", icon: "Users" },
    ],
  
    //  CUSTOMER SCREENS
    customer: [
      { label: "Shop", href: "/", icon: "Store" },
      { label: "My Cart", href: "/cart", icon: "ShoppingBag" },
      { label: "My Orders", href: "/account/orders", icon: "PackageCheck" },
      { label: "Settings", href: "/account/settings", icon: "Settings" },
    ],
  
    //  GUEST SCREENS (Not logged in)
    guest: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutGrid" },
      { label: "Inventory", href: "/admin/products", icon: "Package" },
      { label: "Add Product", href: "/admin/addproducts", icon: "PlusCircle" },
      { label: "Orders", href: "/admin/orders", icon: "List" },
      { label: "Customers", href: "/admin/customers", icon: "Users" },
      { label: "Shop", href: "/", icon: "Store" },
      { label: "Login", href: "/auth/sign-in", icon: "LogIn" },
      { label: "Register", href: "/auth/sign-up", icon: "UserPlus" },
    ]
  };