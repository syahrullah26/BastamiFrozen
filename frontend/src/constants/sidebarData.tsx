import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  BadgePercent,
  UserCheck,
  Wallet,
  TrendingUp,
} from "lucide-react";

export const menuGroups = [
  {
    groupName: "Main",
    roles: ["admin", "employee"],
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "employee"],
      },
    ],
  },
  {
    groupName: "Business & Operations",
    roles: ["admin", "employee"],
    items: [
      {
        name: "Products",
        href: "/products",
        icon: Package,
        roles: ["admin", "employee"],
      },
      {
        name: "Customers",
        href: "/customers",
        icon: Users,
        roles: ["admin", "employee"],
      },
      {
        name: "Suppliers",
        href: "/suppliers",
        icon: Truck,
        roles: ["admin", "employee"],
      },
      {
        name: "Purchases",
        href: "/purchases",
        icon: ShoppingCart,
        roles: ["admin", "employee"],
      },
      {
        name: "Sales",
        href: "/sales",
        icon: BadgePercent,
        roles: ["admin", "employee"],
      },
    ],
  },
  {
    groupName: "Management & Finance",
    roles: ["admin", "employee"],
    items: [
      {
        name: "Employees",
        href: "/employees",
        icon: Users,
        roles: ["admin", "employee"],
      },
      {
        name: "Attendance",
        href: "/attendance",
        icon: UserCheck,
        roles: ["admin"],
      },
      { name: "Expenses", href: "/expenses", icon: Wallet, roles: ["admin"] }, // ⚠️ Hanya Admin
      {
        name: "Revenue",
        href: "/revenue",
        icon: TrendingUp,
        roles: ["admin", "employee"],
      },
    ],
  },
];
