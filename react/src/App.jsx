import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import FeaturesPage from './pages/FeaturesPage.jsx'
import PricingPage from './pages/PricingPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import SupportPage from './pages/SupportPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import Dashboard from './dashboard/Dashboard.jsx'
import AdminDashboard from './admindashboard/AdminDashboard.jsx'
import { useCurrentPath } from './navigation.js'
import './App.css'

const pages = {
  '/': HomePage,
  '/features': FeaturesPage,
  '/pricing': PricingPage,
  '/about': AboutPage,
  '/support': SupportPage,
  '/login': LoginPage,
  '/signup': SignupPage,
}

export default function App() {
  const path = useCurrentPath()
  if (path.startsWith('/dashboard')) return <Dashboard />
  if (path === '/admin' || path.startsWith('/admin/')) return <AdminDashboard path={path} />
  const Page = pages[path] ?? HomePage
  const isLogin = path === '/login' || path === '/signup'

  return (
    <div className="site-shell">
      <Header />
      <main>
        <Page />
      </main>
      {!isLogin && <Footer />}
    </div>
  )
}
