import React from 'react'

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <span className="text-2xl font-bold">Moa Tradecenter</span>
          </div>
        </div>
      </header>

      <main className="py-6">
        {children}
      </main>
    </div>
  )
}

export default Layout