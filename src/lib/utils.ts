import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function calculateWeeksPregnant(lastPeriodDate: Date): number {
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - lastPeriodDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7)
}

export function getRiskColor(risk: string): string {
  switch (risk.toLowerCase()) {
    case 'low':
      return 'text-success-600 bg-success-50 border-success-200'
    case 'moderate':
      return 'text-warning-600 bg-warning-50 border-warning-200'
    case 'high':
      return 'text-danger-600 bg-danger-50 border-danger-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}