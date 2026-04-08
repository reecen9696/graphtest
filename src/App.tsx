import { useMockBets } from './hooks/useMockBets'
import { WagerGraph } from './components/WagerGraph'

function App() {
  const bets = useMockBets()

  return (
    <div className="page">
      <WagerGraph bets={bets} />
    </div>
  )
}

export default App
