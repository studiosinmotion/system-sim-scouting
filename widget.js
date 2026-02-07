// widget.js
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Configuration
const SUPABASE_URL = 'https://rmtyebyzitzgkplxvzxg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2qDg3Jssg_fTPdXl_3Ku-g_1yOkdJ3i';

class SimScoutingWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  connectedCallback() {
    this.render();
    this.trackPageView();
  }

  async trackPageView() {
    // 1. Get Campaign ID from attribute
    const campaignId = this.getAttribute('campaign-id');
    // 2. Get Scout ID from URL parameter "ref"
    const urlParams = new URLSearchParams(window.location.search);
    const scoutId = urlParams.get('ref');

    if (scoutId) {
        try {
            await this.supabase.from('tracking_events').insert({
                scout_id: scoutId,
                event_type: 'page_view',
                meta_data: { campaign_id: campaignId }
            });
            console.log('SIM-WIDGET: Page View Tracked');
        } catch (e) {
            console.warn('SIM-WIDGET: Tracking failed', e);
        }
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 400px;
          margin: 0 auto;
          
          /* Dark Mode Variables */
          --bg-color: #1a1a1a;
          --input-bg: #111111;
          --text-color: #ffffff;
          --text-muted: #a0aec0;
          --border-color: #333333;
          --primary-color: #00b4d8; /* SIM Cyan */
          --primary-hover: #0096b4;
          --success-bg: #064e3b;
          --success-border: #059669;
          --success-text: #a7f3d0;
        }

        /* Container Card */
        #widget-container {
          background: var(--bg-color);
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
          border: 1px solid #2d2d2d;
          color: var(--text-color);
        }

        h2 {
          text-align: center;
          color: var(--text-color);
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.025em;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        label {
          font-weight: 500;
          color: var(--text-muted);
          font-size: 0.875rem;
          margin-left: 4px;
        }

        input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          font-size: 1rem;
          color: var(--text-color);
          background-color: var(--input-bg);
          transition: all 0.2s ease;
          box-sizing: border-box;
          outline: none;
        }

        input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px rgba(0, 180, 216, 0.15);
          background-color: #000;
        }

        input::placeholder {
          color: #555;
        }

        button {
          width: 100%;
          background: linear-gradient(135deg, var(--primary-color) 0%, #0096b4 100%);
          color: white;
          border: none;
          padding: 1rem;
          font-size: 1rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          transition: transform 0.1s, box-shadow 0.2s;
          margin-top: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 6px rgba(0, 180, 216, 0.2);
        }

        button:hover {
          box-shadow: 0 6px 12px rgba(0, 180, 216, 0.3);
          transform: translateY(-1px);
        }

        button:active {
          transform: translateY(1px);
        }

        button:disabled {
          background: #444;
          cursor: not-allowed;
          box-shadow: none;
          color: #888;
        }

        .success-message {
          text-align: center;
          display: none;
          padding: 1.5rem;
          background: var(--success-bg);
          border: 1px solid var(--success-border);
          border-radius: 10px;
          color: var(--success-text);
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .success-message h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          color: white;
        }

        .success-message p {
          margin: 0;
          font-size: 0.95rem;
          opacity: 0.9;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          text-align: center;
          margin-top: 0.5rem;
          display: none;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      </style>
      
      <div id="widget-container">
        <h2>Gratis Training sichern</h2>
        <form id="scout-form">
          <div class="input-group">
          <div class="input-group">
            <label for="first_name">Vorname</label>
            <input type="text" id="first_name" name="first_name" required placeholder="Max">
          </div>
          <div class="input-group">
            <label for="last_name">Nachname</label>
            <input type="text" id="last_name" name="last_name" required placeholder="Mustermann">
          </div>
          <div class="input-group">
            <label for="phone">Telefon</label>
            <input type="tel" id="phone" name="phone" required placeholder="Deine Nummer">
          </div>
          <button type="submit" id="submit-btn">Jetzt Starten</button>
          <div class="error-message" id="error-msg"></div>
        </form>
        <div class="success-message" id="success-msg">
          <h3>Vielen Dank! 🚀</h3>
          <p>Deine Anfrage ist eingegangen. <br>Wir melden uns bei dir!</p>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('scout-form').addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const btn = this.shadowRoot.getElementById('submit-btn');
    const errorMsg = this.shadowRoot.getElementById('error-msg');
    const form = this.shadowRoot.getElementById('scout-form');
    const successMsg = this.shadowRoot.getElementById('success-msg');

    btn.disabled = true;
    const originalBtnText = btn.textContent;
    btn.textContent = 'Sende...';
    errorMsg.style.display = 'none';

    try {
        const formData = new FormData(form);
        const firstName = formData.get('first_name');
        const lastName = formData.get('last_name');
        const phone = formData.get('phone');
        
        // 1. Get Campaign ID
        const campaignId = this.getAttribute('campaign-id');

        // 2. Get Scout ID
        const urlParams = new URLSearchParams(window.location.search);
        let scoutId = urlParams.get('ref');
        
        // Debug override for localhost
        if (!scoutId && window.location.hostname === 'localhost') scoutId = '0e13eb93-b8fa-4801-a800-13a4ce596be2';

        const payload = {
          campaign_id: campaignId || null, 
          scout_id: scoutId || null,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          lead_data: { first_name: firstName, last_name: lastName, phone: phone },
          status: 'pending'
        };

        const { error } = await this.supabase
            .from('invites')
            .insert(payload);

        if (error) throw error;

        // Force UI update by replacing content
        const container = this.shadowRoot.getElementById('widget-container');
        container.innerHTML = `
            <div style="text-align:center; padding:2rem; color: #a7f3d0;">
                <h3 style="color:white; margin-bottom:1rem; font-size:1.5rem;">Vielen Dank! 🚀</h3>
                <p style="font-size:1.1rem; line-height:1.6;">Deine Anfrage ist eingegangen.<br>Wir melden uns bei dir!</p>
            </div>
        `;

    } catch (err) {
      console.error('Submission error:', err);
      
      errorMsg.textContent = 'Fehler: ' + (err.message || 'Verbindung fehlgeschlagen');
      errorMsg.style.display = 'block';
      errorMsg.style.color = 'red';
      
      btn.disabled = false;
      btn.textContent = originalBtnText;
    }
  }
}

customElements.define('sim-scouting-widget', SimScoutingWidget);
