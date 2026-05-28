import { Briefcase, BookOpen, Film, Dumbbell, type LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'

const iconMap: Record<string, ComponentType<LucideProps>> = {
  Briefcase,
  BookOpen,
  Film,
  Dumbbell,
}

interface DimensionIconProps extends LucideProps {
  name: string
}

export function DimensionIcon({ name, ...props }: DimensionIconProps) {
  const Icon = iconMap[name]
  if (!Icon) return null
  return <Icon {...props} />
}
