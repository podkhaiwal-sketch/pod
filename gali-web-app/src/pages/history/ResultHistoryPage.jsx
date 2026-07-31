import { useEffect, useState } from 'react'
import { ROUTE_PATHS } from '../routes'
import { getAllGameResultsByMonth } from '../../services/historyService'
import AppIcon from '../common/AppIcon'
import './resultHistory.css'

function getCurrentMonthInput() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${now.getFullYear()}-${month}`
}

function ResultHistoryPage({ navigate }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [month, setMonth] = useState(getCurrentMonthInput())
  const [columns, setColumns] = useState([])
  const [rows, setRows] = useState([])
  const [totalDays, setTotalDays] = useState(0)

  const loadResults = async (nextMonth = month) => {
    setLoading(true)
    setError('')
    try {
      const result = await getAllGameResultsByMonth(nextMonth)
      setColumns(result.columns)
      setRows(result.rows)
      setTotalDays(result.totalDays)
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Unable to fetch monthly results.')
      setColumns([])
      setRows([])
      setTotalDays(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResults(month)
  }, [])

  return (
    <div className="result-history-page">
      <header className="rh-topbar">
        <button type="button" className="rh-back-btn" onClick={() => navigate(ROUTE_PATHS.home)}>
          <AppIcon name="home" />
        </button>
        <h1>Result History</h1>
        <button type="button" className="rh-refresh-btn" onClick={() => loadResults(month)}>
          <AppIcon name="history" />
        </button>
      </header>

      <section className="rh-controls">
        <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        <button type="button" onClick={() => loadResults(month)}>
          Show Results
        </button>
      </section>

      {loading ? <p className="rh-state">Loading monthly results...</p> : null}
      {error ? <p className="rh-state error">{error}</p> : null}
      {!loading && !error ? <p className="rh-state">Total Days: {totalDays}</p> : null}

      <div className="rh-table-wrap">
        <table className="rh-table">
          <thead>
            <tr>
              {(columns.length ? columns : ['date']).map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.date || 'd'}-${index}`}>
                {(columns.length ? columns : ['date']).map((column) => (
                  <td key={`${index}-${column}`}>{row[column] ?? '--'}</td>
                ))}
              </tr>
            ))}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={Math.max(columns.length, 1)}>No result data found for selected month.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ResultHistoryPage
