import { useState } from 'react'
import Link from '../components/Link.jsx'
import Icon from '../components/Icon.jsx'
import { apiRequest } from '../api.js'
import { navigateTo } from '../navigation.js'

const initialForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  address: '',
  apartment: '',
  city: '',
  state: '',
  zip: '',
  citizenship: '',
  employment: '',
  occupation: '',
  income: '',
  accountPurpose: '',
  certifyIdentity: false,
  agreeTerms: false,
  agreeElectronic: false,
}

const steps = ['Personal details', 'Identity & address', 'Account profile', 'Review & consent']
const adultLimit = new Date()
adultLimit.setFullYear(adultLimit.getFullYear() - 18)
const latestBirthDate = `${adultLimit.getFullYear()}-${String(adultLimit.getMonth() + 1).padStart(2, '0')}-${String(adultLimit.getDate()).padStart(2, '0')}`
const states = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['FL', 'Florida'], ['GA', 'Georgia'],
  ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'],
  ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
  ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'],
  ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'], ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'],
  ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
  ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'],
  ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
  ['DC', 'District of Columbia'],
]

export default function SignupPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [complete, setComplete] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function updateField(event) {
    const { name, value, type, checked } = event.target
    event.target.setCustomValidity('')
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (step === 0 && form.password !== form.confirmPassword) {
      const confirmation = event.currentTarget.elements.confirmPassword
      confirmation.setCustomValidity('Passwords must match.')
      confirmation.reportValidity()
      return
    }

    if (step < steps.length - 1) {
      setStep((current) => current + 1)
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const registration = {
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        email: form.email,
        phone: form.phone,
        password: form.password,
        address: form.address,
        apartment: form.apartment,
        city: form.city,
        state: form.state,
        zip: form.zip,
        citizenship: form.citizenship,
        employment: form.employment,
        occupation: form.occupation,
        income: form.income,
        accountPurpose: form.accountPurpose,
      }
      await apiRequest('/auth/register', { method: 'POST', body: registration })
      setForm(initialForm)
      setComplete(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleBack() {
    setStep((current) => Math.max(0, current - 1))
  }

  if (complete) {
    return (
      <section className="signup-page">
        <div className="signup-container signup-complete">
          <Link href="/" className="brand"><span className="brand-mark"><i /><i /></span><span>Nexora Safe Bank</span></Link>
          <span className="signup-success-icon"><Icon name="check" size={30} /></span>
          <span className="eyebrow">NEXORA PROFILE CREATED</span>
          <h1>Welcome to<br />Nexora</h1>
          <p>A zero-balance account was created for you.</p>
          <button type="button" className="button button-dark" onClick={() => navigateTo('/dashboard')}>Open your dashboard <Icon name="arrow" size={16} /></button>
        </div>
      </section>
    )
  }

  return (
    <section className="signup-page">
      <div className="signup-container">
        <div className="signup-heading">
          <Link href="/" className="brand"><span className="brand-mark"><i /><i /></span><span>Nexora Safe Bank</span></Link>
          <Link className="signup-login-link" href="/login">Already a customer? <strong>Log in</strong></Link>
        </div>
        <div className="signup-progress">
          <span>PERSONAL BANKING</span>
          <span>STEP {step + 1} OF {steps.length}</span>
        </div>
        <div className="signup-progress-track" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((label, index) => <span className={index <= step ? 'complete' : ''} key={label} />)}
        </div>
        <div className="signup-title">
          <span className="eyebrow">{steps[step].toUpperCase()}</span>
          <h1>{['Let’s get to know you.', 'Verify your identity.', 'A little about your account.', 'Review and agree.'][step]}</h1>
          <p>{['Enter profile details to get started.', 'Use real address information only.', 'Choose sample account preferences.', 'Review your profile details.'][step]}</p>
        </div>

        {/* <div className="signup-demo-warning" role="note">
          <Icon name="lock" size={19} />
          <p><strong>Local demo only — do not enter real personal, financial, or identity information.</strong> The submitted demo profile is stored in the configured local PostgreSQL database. Taxpayer IDs are not requested or stored.</p>
        </div> */}

        <form className="signup-form" onSubmit={handleSubmit}>
          {step === 0 && (
            <div className="signup-fields">
              <div className="form-field"><label htmlFor="signup-first">Legal first name</label><input id="signup-first" name="firstName" autoComplete="given-name" value={form.firstName} onChange={updateField} required /></div>
              <div className="form-field"><label htmlFor="signup-middle">Middle name <span>(optional)</span></label><input id="signup-middle" name="middleName" autoComplete="additional-name" value={form.middleName} onChange={updateField} /></div>
              <div className="form-field"><label htmlFor="signup-last">Legal last name</label><input id="signup-last" name="lastName" autoComplete="family-name" value={form.lastName} onChange={updateField} required /></div>
              <div className="form-field"><label htmlFor="signup-dob">Date of birth</label><input id="signup-dob" name="dateOfBirth" type="date" autoComplete="bday" max={latestBirthDate} value={form.dateOfBirth} onChange={updateField} required /><small>You must be 18 or older to open an individual account.</small></div>
              <div className="form-field"><label htmlFor="signup-email">Email address</label><input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={updateField} required /></div>
              <div className="form-field"><label htmlFor="signup-phone">Mobile phone number</label><input id="signup-phone" name="phone" type="tel" autoComplete="tel" placeholder="(555) 555-0100" value={form.phone} onChange={updateField} required /></div>
              <div className="form-field"><label htmlFor="signup-password">Create password</label><input id="signup-password" name="password" type="password" autoComplete="new-password" minLength="12" value={form.password} onChange={updateField} required /><small>Use at least 12 characters.</small></div>
              <div className="form-field"><label htmlFor="signup-confirm-password">Confirm password</label><input id="signup-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength="12" value={form.confirmPassword} onChange={updateField} required /><small>{form.confirmPassword && form.password !== form.confirmPassword ? 'Passwords do not match.' : ' '}</small></div>
            </div>
          )}

          {step === 1 && (
            <>
              <div className="signup-fields">
                <div className="form-field form-field-full"><label htmlFor="signup-address">Residential street address</label><input id="signup-address" name="address" autoComplete="address-line1" placeholder="Street address (no P.O. boxes)" value={form.address} onChange={updateField} required /></div>
                <div className="form-field form-field-full"><label htmlFor="signup-apartment">Apartment, suite, or unit <span>(optional)</span></label><input id="signup-apartment" name="apartment" autoComplete="address-line2" value={form.apartment} onChange={updateField} /></div>
                <div className="form-field"><label htmlFor="signup-city">City</label><input id="signup-city" name="city" autoComplete="address-level2" value={form.city} onChange={updateField} required /></div>
                <div className="form-field"><label htmlFor="signup-state">State</label><select id="signup-state" name="state" autoComplete="address-level1" value={form.state} onChange={updateField} required><option value="">Select state</option>{states.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></div>
                <div className="form-field"><label htmlFor="signup-zip">ZIP code</label><input id="signup-zip" name="zip" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" placeholder="12345" value={form.zip} onChange={updateField} required /></div>
                <div className="form-field"><label htmlFor="signup-citizenship">Citizenship / residency</label><select id="signup-citizenship" name="citizenship" value={form.citizenship} onChange={updateField} required><option value="">Select one</option><option>U.S. citizen</option><option>U.S. permanent resident</option><option>Other U.S. resident</option></select></div>
              </div>
              <p className="signup-identity-note">U.S. financial institutions generally verify identity under federal customer-identification rules. Actual eligibility and documentation depend on the bank and applicant.</p>
            </>
          )}

          {step === 2 && (
            <div className="signup-fields">
              <div className="form-field"><label htmlFor="signup-employment">Employment status</label><select id="signup-employment" name="employment" value={form.employment} onChange={updateField} required><option value="">Select status</option><option>Employed</option><option>Self-employed</option><option>Student</option><option>Retired</option><option>Not currently employed</option></select></div>
              <div className="form-field"><label htmlFor="signup-occupation">Occupation / industry</label><input id="signup-occupation" name="occupation" placeholder="For example, education" value={form.occupation} onChange={updateField} required /></div>
              <div className="form-field"><label htmlFor="signup-income">Annual income range</label><select id="signup-income" name="income" value={form.income} onChange={updateField} required><option value="">Select range</option><option>Under $25,000</option><option>$25,000–$49,999</option><option>$50,000–$99,999</option><option>$100,000–$249,999</option><option>$250,000 or more</option><option>Prefer not to say</option></select></div>
              <div className="form-field"><label htmlFor="signup-purpose">Primary account purpose</label><select id="signup-purpose" name="accountPurpose" value={form.accountPurpose} onChange={updateField} required><option value="">Select purpose</option><option>Everyday spending</option><option>Direct deposit</option><option>Saving</option><option>Paying bills</option><option>Other personal use</option></select></div>
            </div>
          )}

          {step === 3 && (
            <div className="signup-review">
              <h2>Application details</h2>
              <dl>
                <div><dt>Legal name</dt><dd>{[form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ')}</dd></div>
                <div><dt>Date of birth</dt><dd>{form.dateOfBirth}</dd></div>
                <div><dt>Email and mobile</dt><dd>{form.email} · {form.phone}</dd></div>
                <div><dt>Residential address</dt><dd>{[form.address, form.apartment, form.city, form.state, form.zip].filter(Boolean).join(', ')}</dd></div>
                <div><dt>Account purpose</dt><dd>{form.accountPurpose}</dd></div>
              </dl>
              <label className="consent-check"><input type="checkbox" name="certifyIdentity" checked={form.certifyIdentity} onChange={updateField} required /><span>I certify that the information provided is accurate and complete to the best of my knowledge.</span></label>
              <label className="consent-check"><input type="checkbox" name="agreeTerms" checked={form.agreeTerms} onChange={updateField} required /><span>I acknowledge that a real bank would provide account terms, fee disclosures, privacy notices, and required tax certifications before account opening.</span></label>
              <label className="consent-check"><input type="checkbox" name="agreeElectronic" checked={form.agreeElectronic} onChange={updateField} required /><span>I consent to electronic delivery of account documents for this interactive demo.</span></label>
              {/* <p className="signup-final-note">A simulated profile and zero-balance account will be created in the local demo database. This prototype is not a bank, does not verify identity, and does not provide banking services.</p> */}
            </div>
          )}

          {error && <p className="login-error" role="alert">{error}</p>}
          <div className="signup-actions">
            {step > 0 ? <button className="button button-outline" type="button" onClick={handleBack}>Back</button> : <Link className="button button-outline" href="/">Cancel</Link>}
            <button className="button button-dark" type="submit" disabled={submitting}>{submitting ? 'Creating profile…' : step === steps.length - 1 ? 'Create demo profile' : 'Continue'} <Icon name="arrow" size={16} /></button>
          </div>
        </form>
        {/* <div className="signup-footer"><Icon name="lock" size={15} /><span>Never share real sensitive information in this demo.</span><span>•</span><Link href="/support">Need help?</Link></div> */}
      </div>
    </section>
  )
}
