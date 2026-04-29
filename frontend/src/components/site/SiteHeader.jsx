import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Button from '../ui/Button'

const navItems = [
  { label: 'About', to: '/' },
  { label: 'Scan Website', to: '/scan' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'FAQ', to: '/#faq' },
]

function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <div className="border-b border-deepSoft/20 bg-bg/95 py-2">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-center gap-3 px-5 text-xs text-textSecondary sm:px-8 sm:text-sm lg:px-12 2xl:px-16">
            <span className="rounded-full border border-deep/35 bg-deep/10 px-2 py-0.5 font-semibold text-deep">
            WCAG 2.1 AA
          </span>
          <p>AI-powered WCAG compliance for healthcare websites.</p>
          <span className="hidden text-textSecondary sm:inline">Healthcare-ready workflow</span>
        </div>
      </div>
      <header className={`sticky top-0 z-50 transition ${scrolled ? 'border-b border-deepSoft/20 bg-bg/90 backdrop-blur-lg' : 'bg-transparent'}`}>
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12 2xl:px-16">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-deep">
            <img
              src="/accessimed-logo.svg"
              alt="AccessiMed logo"
              className="h-8 w-8 rounded-lg border border-deep/30 bg-light object-contain p-1"
            />
            AccessiMed
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm transition ${isActive ? 'text-deep underline decoration-primary decoration-2 underline-offset-4' : 'text-textSecondary hover:text-deep'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button to="/dashboard" variant="secondary">View Dashboard</Button>
            <Button to="/scan">Start Scan</Button>
          </div>

          <button
            type="button"
            className="rounded-lg border border-deepSoft/35 px-3 py-2 text-sm text-deep md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            Menu
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-deepSoft/20 bg-bg/95 px-4 py-3 md:hidden">
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-bgSecondary/60 text-deep' : 'text-textSecondary hover:bg-bgSecondary/50 hover:text-deep'}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button to="/dashboard" variant="secondary">View Dashboard</Button>
                <Button to="/scan">Start Scan</Button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default SiteHeader
