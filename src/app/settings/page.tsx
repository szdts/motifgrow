'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Settings, Bell, Palette, Calendar, Shield, Globe } from 'lucide-react'

interface SettingRowProps {
  icon: typeof Settings
  label: string
  description: string
  color?: string
}

function SettingRow({ icon: Icon, label, description, color = 'rgba(0,0,0,0.48)' }: SettingRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-[8px] px-4 py-3.5 cursor-pointer transition-colors hover:bg-black/[0.03]">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-[8px] shrink-0"
        style={{ backgroundColor: `${color}14` }}
      >
        <Icon className="h-4.5 w-4.5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-[#1d1d1f]">{label}</div>
        <div className="text-[12px] text-black/[0.48]">{description}</div>
      </div>
      <svg className="h-4 w-4 text-black/[0.2] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  )
}

const settingGroups = [
  {
    title: '偏好设置',
    items: [
      { icon: Calendar, label: '日历设置', description: '默认视图、时间范围、起始日', color: '#0071e3' },
      { icon: Palette, label: '外观与主题', description: '配色方案、维度颜色自定义', color: '#bf4800' },
      { icon: Bell, label: '通知', description: '事件提醒、建议推送', color: '#ff3b30' },
    ],
  },
  {
    title: '数据与隐私',
    items: [
      { icon: Shield, label: '隐私与安全', description: '数据加密、备份与恢复', color: '#248a3d' },
      { icon: Globe, label: '语言与地区', description: '界面语言、时区设置', color: '#86868b' },
    ],
  },
]

export default function SettingsPage() {
  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <div className="px-8 py-7 max-w-2xl">
          <h1 className="text-[24px] font-semibold tracking-tight text-[#1d1d1f] mb-1">
            设置
          </h1>
          <p className="text-[14px] text-black/[0.48] mb-8">
            自定义你的 Motifgrow 体验
          </p>

          <div className="space-y-6">
            {settingGroups.map((group) => (
              <section key={group.title}>
                <h2 className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48] mb-3 px-4">
                  {group.title}
                </h2>
                <div className="rounded-[12px] bg-white overflow-hidden">
                  {group.items.map((item, i) => (
                    <div key={item.label}>
                      <SettingRow
                        icon={item.icon}
                        label={item.label}
                        description={item.description}
                        color={item.color}
                      />
                      {i < group.items.length - 1 && (
                        <div className="mx-4 h-px bg-black/[0.06]" />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-[12px] text-black/[0.24]">
              Motifgrow v0.1.0
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
