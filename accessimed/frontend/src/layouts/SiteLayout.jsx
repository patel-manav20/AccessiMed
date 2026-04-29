import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import SiteHeader from '../components/site/SiteHeader'
import SiteFooter from '../components/site/SiteFooter'

function SiteLayout() {
  const location = useLocation()

  useEffect(() => {
    const hash = location.hash?.replace('#', '')
    if (!hash) return
    const target = document.getElementById(hash)
    if (!target) return

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      target.classList.add('section-target-flash')
      window.setTimeout(() => {
        target.classList.remove('section-target-flash')
      }, 1400)
    })
  }, [location.pathname, location.hash])

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg via-bgSecondary/60 to-bg">
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

export default SiteLayout
