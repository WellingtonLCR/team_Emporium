import React from "react";
import AdminHeader from "./AdminHeader";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />
      <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
