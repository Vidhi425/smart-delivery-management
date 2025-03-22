"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, Package, Users, ClipboardList, BarChart3, Settings } from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { name: "Dashboard", href: "/", icon: <Home size={20} /> },
    { name: "Orders", href: "/orders", icon: <Package size={20} /> },
    { name: "Partners", href: "/partners", icon: <Users size={20} /> },
    { name: "Assignments", href: "/assignments", icon: <ClipboardList size={20} /> },
    { name: "Metrics", href: "/metrics", icon: <BarChart3 size={20} /> },
    { name: "Settings", href: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button onClick={toggleSidebar} className="p-2 md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white rounded-md">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`h-screen fixed inset-y-0 left-0 bg-gray-900 text-white w-64 p-5 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform md:translate-x-0 md:relative md:w-64 z-40`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-center flex items-center">Admin Panel</h2>
          <button onClick={toggleSidebar} className="md:hidden">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition"
            >
              {item.icon} <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
