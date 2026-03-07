"use client";

import Header from "./Header";
import GlobalModals from "./GlobalModals";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">

        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>

      {/* Global Modals */}
      <GlobalModals />

    </div>
  );
}