import RecordsPage from './RecordsPage'
import { getMyWins } from '../../services/recordsService'

const columns = [
  { key: 'index', label: 'S.No', render: (_row, index) => index + 1 },
  { key: 'datetime', label: 'Date' },
  { key: 'market_name', label: 'Market' },
  { key: 'pred_num', label: 'Number' },
  { key: 'tr_value', label: 'Bet' },
  { key: 'win_value', label: 'Win Amount' },
]

function MyWinsPage(props) {
  return (
    <RecordsPage
      {...props}
      title="My wins"
      subtitle="Winning results and payouts"
      loadRows={getMyWins}
      columns={columns}
    />
  )
}

export default MyWinsPage
