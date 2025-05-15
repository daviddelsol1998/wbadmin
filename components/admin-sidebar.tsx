"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const tabs = [
    {
      id: "wrestlers",
      name: "Wrestlers",
    },
    {
      id: "promotions",
      name: "Promotions",
    },
    {
      id: "factions",
      name: "Factions",
    },
    {
      id: "championships",
      name: "Championships",
    },
  ]

  return (
    <aside className="w-64 border-r bg-background">
      <nav className="flex flex-col gap-2 p-4">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            className={cn("justify-start", activeTab === tab.id && "bg-green-600 hover:bg-green-700")}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </Button>
        ))}
      </nav>
    </aside>
  )
}
