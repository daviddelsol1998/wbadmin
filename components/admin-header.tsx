"use client"

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">WrestleBracket Admin</h1>
        </div>
      </div>
    </header>
  )
}
