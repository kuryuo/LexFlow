import { Flashcard } from './components/flashcards/Flashcard'
import { LevelStatsCard } from './components/stats/LevelStatsCard'

function App() {
  return (
    <>
      <LevelStatsCard
        stats={{
          level: 'A1',
          newCount: 120,
          learningCount: 40,
          knownCount: 30,
          totalCount: 190,
        }}
      />
      <Flashcard level='A2' front='привет' back='hi' transcription='hai:' />
    </>
  )
}

export default App
