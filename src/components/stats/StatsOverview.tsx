import { useEffect } from 'react'

import { useStatsStore } from '@/store/stats.store'
import type { StudyLevel } from '@/types'

import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Skeleton } from '../ui/skeleton'

import { LevelStatsCard } from './LevelStatsCard'

interface StatsOverviewState {
  selectedLevel: StudyLevel
}

export const StatsOverview = ({ selectedLevel }: StatsOverviewState) => {
  const { stats, isLoading, error, loadStats } = useStatsStore()

  useEffect(() => {
    void loadStats(selectedLevel)
  }, [selectedLevel, loadStats])

  if (isLoading) {
    return <Skeleton className='h-48 w-full' />
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertTitle>Не удалось загрузить статистику</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='w-full'>{stats && <LevelStatsCard stats={stats} />}</div>
  )
}
