import { MotionConfig } from 'motion/react'
import { LanguageProvider, useLang } from './lib/i18n'
import { useSmoothScroll } from './lib/scroll'
import { Intro } from './components/Intro'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Services } from './components/Services'
import { Why } from './components/Why'
import { HowItWorks } from './components/HowItWorks'
import { NextStep } from './components/NextStep'
import { Footer } from './components/Footer'
import { FloatingWhatsApp } from './components/FloatingWhatsApp'

function Page() {
  const { t } = useLang()
  useSmoothScroll()
  return (
    <>
      <a className="skip-link" href="#main">
        {t.skip}
      </a>
      <Intro />
      <Nav />
      <div className="site">
        <main id="main">
          <Hero />
          <Services />
          <Why />
          <HowItWorks />
          <NextStep />
        </main>
        <Footer />
      </div>
      <FloatingWhatsApp />
      <div className="grain" aria-hidden="true" />
    </>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <Page />
      </LanguageProvider>
    </MotionConfig>
  )
}
