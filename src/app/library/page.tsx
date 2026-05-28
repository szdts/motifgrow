import { Sidebar } from '@/components/layout/sidebar'

export default function LibraryPage() {
  return (
    <>
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-xl font-semibold mb-4">媒体库</h1>
        <div className="rounded-xl border border-dashed border-divider p-12 text-center text-text-tertiary text-sm">
          Phase 3 — 媒体库页面开发中
        </div>
      </main>
    </>
  )
}
