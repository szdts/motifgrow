import { Sidebar } from '@/components/layout/sidebar'

export default function SettingsPage() {
  return (
    <>
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-xl font-semibold mb-4">设置</h1>
        <div className="rounded-xl border border-dashed border-divider p-12 text-center text-text-tertiary text-sm">
          Phase 4 — 设置页面开发中
        </div>
      </main>
    </>
  )
}
