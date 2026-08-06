import MyGamePage from '../mygame/MyGamePage'

function HistoryPage(props) {
  return <MyGamePage {...props} pageTitle="History" hideWalletTab={false} />
}

export default HistoryPage
