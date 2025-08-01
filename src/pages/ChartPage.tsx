import TokenChart from '../components/TokenChart'


const ChartPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-font)]">
  
      <div className="max-w-6xl mx-auto px-4 py-8">
        <TokenChart />
      </div>
    </div>
  )
}

export default ChartPage