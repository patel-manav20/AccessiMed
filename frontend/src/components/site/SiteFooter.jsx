import { Link } from 'react-router-dom'

function SiteFooter() {
  const columns = {
    Product: [
      { label: 'About', to: '/' },
      { label: 'Scan Website', to: '/scan' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'AI Fixes', to: '/' },
      { label: 'Reports', to: '/' },
    ],
    Resources: [
      { label: 'Workflow', to: '/' },
      { label: 'FAQ', to: '/#faq' },
      { label: 'Accessibility Statement', to: '/' },
      { label: 'Contact', to: '/' },
    ],
    Legal: [
      { label: 'Privacy', to: '/' },
      { label: 'Terms', to: '/' },
      { label: 'Support', to: '/' },
      { label: 'Compliance', to: '/' },
    ],
  }

  return (
    <footer className="border-t border-deepSoft/20 bg-deep">
      <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12 2xl:px-16">
        <div>
          <div className="flex items-center gap-2">
            <img
              src="/accessimed-logo.svg"
              alt="AccessiMed logo"
              className="h-7 w-7 rounded-md border border-primary/40 bg-bg/80 object-contain p-1"
            />
            <p className="font-display text-xl font-bold text-light">AccessiMed</p>
          </div>
          <p className="mt-3 text-sm text-soft/85">
            AI-powered healthcare accessibility compliance platform designed to turn findings into actionable remediation.
          </p>
        </div>
        {Object.entries(columns).map(([title, links]) => (
          <div key={title}>
            <p className="text-sm font-semibold text-light">{title}</p>
            <ul className="mt-3 space-y-2 text-sm text-soft/85">
              {links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="transition hover:text-light">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-secondary/20">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-5 py-4 text-xs text-soft/80 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12 2xl:px-16">
          <p>© {new Date().getFullYear()} AccessiMed. All rights reserved.</p>
          <p>Built with accessibility in mind.</p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
