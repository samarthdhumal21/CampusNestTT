import React, { useState } from 'react';
import { SectionLabel } from './SectionLabel';
import { Mail, MapPin, Users, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ContactFeedback: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Question',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill out all fields.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <section className="ecoriz-section">
      <div className="section-container">
        <SectionLabel label="Contact & Feedback" />
        <div className="section-heading-group">
          <h2 className="section-main-heading">Get in Touch with Our Team</h2>
          <p className="section-sub-heading">Questions about our Kolhapur student living algorithm or hackathon submission?</p>
        </div>

        <div className="contact-two-col-grid">
          {/* Left Card: Navy Card */}
          <div className="contact-navy-card">
            <div>
              <span className="contact-pill-tag">Hackathon Project</span>
              <h3 className="contact-card-title">Let's Connect</h3>
              <p className="contact-card-sub">
                CampusNest is maintained by a 2-member hackathon team passionate about student mobility and housing transparency in Maharashtra.
              </p>
            </div>

            <div className="contact-info-rows">
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Mail size={16} color="#A9C8E8" />
                </div>
                <div>
                  <div className="contact-info-lbl">Project Demo Email</div>
                  <div className="contact-info-val">team@campusnest-kolhapur.demo</div>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <MapPin size={16} color="#A9C8E8" />
                </div>
                <div>
                  <div className="contact-info-lbl">Focus Region</div>
                  <div className="contact-info-val">Kolhapur, Maharashtra 416004</div>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Users size={16} color="#A9C8E8" />
                </div>
                <div>
                  <div className="contact-info-lbl">Hackathon Team</div>
                  <div className="contact-info-val">2-Member Student Developer Team</div>
                </div>
              </div>
            </div>

            <div className="contact-demo-pill-note">
              <ShieldAlert size={14} color="#A9C8E8" />
              <span>Demo-only contact info. Inquiries will simulate an instant response.</span>
            </div>
          </div>

          {/* Right Card: Form */}
          <div className="contact-form-card">
            {submitted ? (
              <div className="contact-success-state">
                <div className="success-icon-wrapper">
                  <CheckCircle2 size={40} color="#10B981" />
                </div>
                <h3 className="success-title">Message Received!</h3>
                <p className="success-desc">
                  Thank you for testing the CampusNest demo feedback system. Your simulated message has been recorded for hackathon evaluation.
                </p>
                <button
                  className="pill-btn-ink-cta"
                  style={{ marginTop: '1.5rem' }}
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: 'General Question', message: '' });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-actual-form">
                <div className="form-group-ecoriz">
                  <label className="form-lbl-ecoriz">Your Full Name</label>
                  <input
                    type="text"
                    className="form-input-ecoriz"
                    placeholder="e.g. Atharva Kulkarni"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-ecoriz">
                  <label className="form-lbl-ecoriz">Email Address</label>
                  <input
                    type="email"
                    className="form-input-ecoriz"
                    placeholder="atharva@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-ecoriz">
                  <label className="form-lbl-ecoriz">Subject / Inquiry Type</label>
                  <select
                    className="form-select-ecoriz"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="General Question">General Question about CampusNest</option>
                    <option value="Suggest a College">Suggest an Additional Kolhapur College</option>
                    <option value="Mess Recommendation">Suggest a Local Student Mess</option>
                    <option value="Hackathon Feedback">Hackathon Feedback & Ideas</option>
                  </select>
                </div>

                <div className="form-group-ecoriz">
                  <label className="form-lbl-ecoriz">Your Message</label>
                  <textarea
                    rows={4}
                    className="form-textarea-ecoriz"
                    placeholder="Tell us what you think or how we can improve living cost calculations..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="pill-btn-ink-cta" style={{ width: '100%', justifyContent: 'center' }}>
                  <span>Send Message</span>
                  <span className="pill-icon-circle-light">
                    <Send size={14} />
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
