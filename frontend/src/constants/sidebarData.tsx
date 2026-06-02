import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  BadgePercent,
  UserCheck,
  Wallet,
  Receipt,
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
        roles: ["admin"],
      },
      {
        name: "Attendance Logs",
        href: "/attendances",
        icon: UserCheck,
        roles: ["admin"],
      },
      {
        name: "Payment Logs",
        href: "/payments",
        icon: Receipt,
        roles: ["admin"],
      },
      { name: "Expense Logs", href: "/expenses", icon: Wallet, roles: ["admin"] },
      {
        name: "Revenue",
        href: "/revenue",
        icon: TrendingUp,
        roles: ["admin"],
      },
    ],
  },
];
