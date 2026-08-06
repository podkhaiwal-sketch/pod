import RecordsPage from './RecordsPage'
import { getStatement } from '../../services/recordsService'

const columns = [
  { key: 'index', label: 'S.No', render: (_row, index) => index + 1 },
  { key: 'date', label: 'Date' },
  { key: 'transaction_name', label: 'Transaction' },
  { key: 'amount', label: 'Amount' },
  { key: 'value_type', label: 'Type' },
  { key: 'remark', label: 'Remark' },
]

function StatementPage(props) {
  return (
    <RecordsPage
      {...props}
      title="Statement"
      subtitle="Wallet and ledger statement"
      loadRows={(userId) => getStatement(userId, 1)}
      columns={columns}
      showMarketFilter={false}
    />
  )
}

export default StatementPage
