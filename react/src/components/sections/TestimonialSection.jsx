import { useState } from 'react'

const testimonials = [
  { name: 'Ellena Putri', quote: 'Overall, this app has been a life-changer for me. It has revolutionized the way I approach my finances, providing me with the tools, insights, and security I need to unlock my financial freedom.', title: 'A more confident way to manage your money' },
  { name: 'Daniel Kim', quote: 'It is so easy to see where my money goes and plan for what is next. Nexora makes my everyday banking feel refreshingly simple.', title: 'A simpler way to feel good about your money' },
  { name: 'Amara Johnson', quote: 'I can spend, save, and send money all from one place. The experience is thoughtful, clear, and genuinely useful.', title: 'Money that moves at your pace' },
]

export default function TestimonialSection() {
  const [active, setActive] = useState(0)
  const current = testimonials[active]
  const move = (direction) => setActive((active + direction + testimonials.length) % testimonials.length)

  return (
    <section className="testimonial-section section-wrap">
      <div className="testimonial-title"><span className="eyebrow">REAL PEOPLE. REAL PROGRESS.</span><h2>{current.title}</h2></div>
      <div className="testimonial-card">
        <div className="customer-portrait" role="img" aria-label={`${current.name}, a Nexora customer`}><div className="portrait-halo" />
        {/* <div className="portrait-hair" /><div className="portrait-face"><span /><i /></div><div className="portrait-body" /><div className="portrait-phone" /> */}
        </div>
        <div className="testimonial-copy"><span className="quote-mark">“</span><p>{current.quote}</p><strong>{current.name}</strong></div>
        <div className="testimonial-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Previous testimonial">←</button>
          <button className="next" type="button" onClick={() => move(1)} aria-label="Next testimonial">→</button>
        </div>
      </div>
    </section>
  )
}
