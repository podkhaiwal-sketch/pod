import RecordsPage from './RecordsPage'
import { getMyBidding } from '../../services/recordsService'

const columns = [
  { key: 'index', label: 'S.No', render: (_row, index) => index + 1 },
  { key: 'datetime', label: 'Date' },
  { key: 'market_name', label: 'Market' },
  { key: 'bettype', label: 'Type' },
  { key: 'pred_num', label: 'Number' },
  { key: 'tr_value', label: 'Points' },
]

function MyBiddingPage(props) {
  return (
    <RecordsPage
      {...props}
      title="My Bidding"
      subtitle="Current and open bid records"
      loadRows={getMyBidding}
      columns={columns}
    />
  )
}

export default MyBiddingPage
