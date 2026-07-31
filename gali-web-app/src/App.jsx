import { getRouteElement, useSimpleRoute } from './pages/routes'

function App() {
  const { pathname, navigate } = useSimpleRoute()
  return getRouteElement(pathname, navigate)
}

export default App
