import { cn, getRiskColor } from '../../lib/utils'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface RiskBadgeProps {
  risk: 'low' | 'moderate' | 'high'
  score?: number
  className?: string
}

export function RiskBadge({ risk, score, className }: RiskBadgeProps) {
  const getRiskIcon = () => {
    switch (risk) {
      case 'low':
        return <CheckCircle className="w-4 h-4" />
      case 'moderate':
        return <AlertTriangle className="w-4 h-4" />
      case 'high':
        return <XCircle className="w-4 h-4" />
    }
  }

  const getRiskText = () => {
    switch (risk) {
      case 'low':
        return 'Low Risk'
      case 'moderate':
        return 'Moderate Risk'
      case 'high':
        return 'High Risk'
    }
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border',
        getRiskColor(risk),
        className
      )}
    >
      {getRiskIcon()}
      <span>{getRiskText()}</span>
      {score !== undefined && (
        <span className="text-xs opacity-75">
          ({Math.round(score * 100)}%)
        </span>
      )}
    </div>
  )
}