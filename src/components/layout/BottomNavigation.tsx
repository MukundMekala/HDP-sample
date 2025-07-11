import { Home, Activity, TrendingUp, User, DivideIcon as LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'input', label: 'Input', icon: Activity },
  { id: 'insights', label: 'Insights', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: User },
]

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors',
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}