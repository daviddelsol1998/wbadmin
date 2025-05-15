"use client"

import { useState } from "react"
import { WrestlerList } from "./wrestler-list"
import { PromotionList } from "./promotion-list"
import { FactionList } from "./faction-list"
import { ChampionshipList } from "./championship-list"
import { AdminHeader } from "./admin-header"
import { AdminSidebar } from "./admin-sidebar"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("wrestlers")

  return (
    <div className="flex h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {activeTab === "wrestlers" && <WrestlerList />}
          {activeTab === "promotions" && <PromotionList />}
          {activeTab === "factions" && <FactionList />}
          {activeTab === "championships" && <ChampionshipList />}
        </main>
      </div>
    </div>
  )
}
