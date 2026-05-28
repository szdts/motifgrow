import { Sidebar } from '@/components/layout/sidebar'

export default function ReviewPage() {
  return (
    <>
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-xl font-semibold mb-4">回顾</h1>
        <div className="rounded-xl border border-dashed border-divider p-12 text-center text-text-tertiary text-sm">
          Phase 5 — 周回顾 + 季度 Wrapped 开发中
        </div>
      </main>
    </>
  )
}
