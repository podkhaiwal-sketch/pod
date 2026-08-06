import RecordsPage from './RecordsPage'
import { getOldRecords } from '../../services/recordsService'

const columns = [
  { key: 'index', label: 'S.No', render: (_row, index) => index + 1 },
  { key: 'datetime', label: 'Date' },
  { key: 'market_name', label: 'Market' },
  { key: 'bettype', label: 'Type' },
  { key: 'pred_num', label: 'Number' },
  { key: 'tr_value', label: 'Points' },
  { key: 'win_value', label: 'Win' },
]

function OldRecordsPage(props) {
  return (
    <RecordsPage
      {...props}
      title="Old Records"
      subtitle="All previous bid records"
      loadRows={getOldRecords}
      columns={columns}
    />
  )
}

export default OldRecordsPage
