import { useEffect, useState } from 'react'
import { ROUTE_PATHS } from '../routes'
import { getUserCredit } from '../../services/homeService'
import { getSession } from '../../services/sessionService'
import SideDrawer from '../common/SideDrawer'
import BottomNav from '../common/BottomNav'
import Header from '../common/Header'
import './terms.css'

const termsLines = [
  'Shree Matka HELP & SUPPORT💥',
  '🔥10 Rs एकल जोड़ी भुगतान = 950 Rs🔥',
  '🔥10 Rs हुर्रफ (A.B.) भुगतान = 90 Rs🔥',
  '🔥भुगतान जमा करने का समय. 24x7🔥',
  '👽गेम कैसे खेलनी है जानिए👽',
  '',
  'दिसावर : 500 रूपये की जोड़ी व 1000 रूपये तक का हरुफ़ रात 12.00 AM तक उसके बाद 100 रूपये तक की ही जोड़ी व 500 रूपये तक हरुफ़ मान्य रहेगा /- अन्यथा हमारी कोई जिम्मेदारी नही होगी !',
  '',
  'गली : 500 रूपये की जोड़ी व 1000 रूपये तक का हरुफ़ रात 10.15 PM तक उसके बाद 100 रूपये तक की ही जोड़ी व 500 रूपये तक हरुफ़ मान्य रहेगा /- अन्यथा हमारी कोई जिम्मेदारी नही होगी !',
  '',
  'गाजियाबाद : 500 रूपये की जोड़ी व 1000 रूपये तक का हरुफ़ शाम 7.15 PM तक उसके बाद 100 रूपये तक की ही जोड़ी व 500 रूपये तक हरुफ़ मान्य रहेगा /- अन्यथा हमारी कोई जिम्मेदारी नही होगी !',
  '',
  'फरीदाबाद : 500 रूपये की जोड़ी व 1000 रूपये तक का हरुफ़ शाम 4.45 PM तक उसके बाद 100 रूपये तक की ही जोड़ी व 500 रूपये तक हरुफ़ मान्य रहेगा /- अन्यथा हमारी कोई जिम्मेदारी नही होगी !',
  '',
  'दिल्ली बाजार व ताज : 500 रूपये की जोड़ी व 1000 रूपये तक का हरुफ़ दोपहर 1.45 PM तक उसके बाद 100 रूपये तक की ही जोड़ी व 500 रूपये तक हरुफ़ मान्य रहेगा /- अन्यथा हमारी कोई जिम्मेदारी नही होगी !',
  '',
  'श्रीगणेश : 500 रूपये की जोड़ी व 1000 रूपये तक का हरुफ़ दोपहर 3.00 PM तक उसके बाद 100 रूपये तक की ही जोड़ी व 500 रूपये तक हरुफ़ मान्य रहेगा /- अन्यथा हमारी कोई जिम्मेदारी नही होगी !',
  '',
  'नोट : महीने की अंतिम तिथि पर दिसावर, गली, गाजियाबाद, फरीदाबाद, दिल्ली बाजार ताज श्रीगणेश की गेम का अवकाश रहेगा !',
]

function TermsPage({ navigate }) {
  const [session] = useState(() => getSession())
  const [credit, setCredit] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!session?.userId) {
      navigate(ROUTE_PATHS.login)
      return
    }

    getUserCredit(session.userId)
      .then((value) => setCredit(Number(value || 0)))
      .catch(() => {})
  }, [navigate, session?.userId])

  if (!session?.userId) return null

  return (
    <div className="terms-page">
      <Header
        credit={credit}
        isMenuOpen={drawerOpen}
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onBalanceClick={() => navigate(ROUTE_PATHS.wallet)}
        onNotification={() => navigate(ROUTE_PATHS.notification)}
      />

      <main className="terms-content">
        {termsLines.map((line, index) =>
          line ? (
            <p key={`${line.slice(0, 8)}-${index}`} className="terms-line">
              {line}
            </p>
          ) : (
            <div key={`space-${index}`} className="terms-space" />
          )
        )}
      </main>

      <BottomNav activeTab="myGame" navigate={navigate} />

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigate={navigate}
        name={session?.name || 'User'}
        mobile={session?.mobileNum || '--'}
      />
    </div>
  )
}

export default TermsPage
