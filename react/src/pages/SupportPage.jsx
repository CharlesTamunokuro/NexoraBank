import { useState } from 'react'
import Icon from '../components/Icon.jsx'

const questions = [
  ['How do I open a Nexora account?', 'Getting started is easy. Choose Open account and follow the steps to create your profile. You’ll need a valid email address and a few minutes to get set up.'],
  ['Is my money safe with Nexora?', 'We use robust security practices to help protect your account, and you can manage your cards and account access directly in the app.'],
  ['Can I hold more than one currency?', 'Yes. Nexora supports balances in more than 30 currencies, all managed from one place.'],
  ['How do I contact the support team?', 'Send us a message at help@finsy.example and our team will be happy to help.'],
]

export default function SupportPage() {
  const [openQuestion, setOpenQuestion] = useState(0)
  return (
    <section className="support-page section-wrap">
      <div className="page-intro">
        <span className="eyebrow">WE’RE HERE TO HELP</span>
        <h1>How can we<br />help you today?</h1>
        <p>Find quick answers below or reach out to our friendly support team.</p>
      </div>
      <div className="support-content">
        <div className="faq-list">
          {questions.map(([question, answer], index) => (
            <article className={`faq-item ${openQuestion === index ? 'faq-open' : ''}`} key={question}>
              <button type="button" aria-expanded={openQuestion === index} onClick={() => setOpenQuestion(openQuestion === index ? -1 : index)}>
                {question}<span>{openQuestion === index ? '−' : '+'}</span>
              </button>
              {openQuestion === index && <p>{answer}</p>}
            </article>
          ))}
        </div>
        <aside className="support-contact"><span className="icon-disc"><Icon name="phone" /></span><h2>Still have questions?</h2><p>Our team is here to make things easy.</p><a href="mailto:help@finsy.example">Email our support team <Icon name="arrow" size={16} /></a></aside>
      </div>
    </section>
  )
}
