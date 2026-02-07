// widget.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Configuration
const SUPABASE_URL = 'https://rmtyebyzitzgkplxvzxg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2qDg3Jssg_fTPdXl_3Ku-g_1yOkdJ3i';

/**
 * Universal Tracking SDK for SIM-Scouting.
 * Handles scout ID persistence, conversion tracking, and hidden field population.
 * Accessible globally via `window.SimScouting`.
 */
class SimScoutingSDK {
  /**
   * Initializes the SDK.
   * Checks URL parameters for scout IDs and persists them to localStorage.
   */
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    this.storageKeyId = 'sim_scout_id';
    this.storageKeyTs = 'sim_scout_ts';
    
    this.init();
  }

  /**
   * Internal initialization logic.
   * Parses URL parameters ('ref', 'scout_id', 'referrer') and saves valid IDs.
   * Updates the timestamp on every visit if an ID is present or found.
   * @private
   */
  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const newScoutId = urlParams.get('ref') || urlParams.get('scout_id') || urlParams.get('referrer');
    const newSource = urlParams.get('source');

    if (newScoutId) {
      // New ID found in URL -> Save/Overwrite
      localStorage.setItem(this.storageKeyId, newScoutId);
      localStorage.setItem(this.storageKeyTs, Date.now().toString());
      console.log('SIM-SDK: New Scout ID saved:', newScoutId);
    } else if (this.getScoutId()) {
      // Existing ID found -> Refresh Timestamp
      localStorage.setItem(this.storageKeyTs, Date.now().toString());
      console.log('SIM-SDK: Existing Scout ID active:', this.getScoutId());
    }

    if (newSource) {
      localStorage.setItem('sim_scout_source', newSource);
      console.log('SIM-SDK: Source saved:', newSource);
    }
  }

  /**
   * Retrieves the currently stored Scout ID.
   * @returns {string|null} The Scout ID from localStorage, or null if not found.
   */
  getScoutId() {
    return localStorage.getItem(this.storageKeyId);
  }

  /**
   * Retrieves the currently stored Source.
   * @returns {string|null} 
   */
  getSource() {
      return localStorage.getItem('sim_scout_source'); // Key matches what was used in init()
  }

  /**
   * Populates hidden input fields with the stored Scout ID.
   * Useful for integrating with third-party forms.
   * @param {string} selector - The CSS selector to find input fields (e.g., '.sim-ref-id').
   * @returns {number} The number of fields updated.
   */
  fillHiddenFields(selector) {
    const scoutId = this.getScoutId();
    if (!scoutId) return 0;

    const inputs = document.querySelectorAll(selector);
    inputs.forEach(input => {
      if (input.tagName === 'INPUT') {
        input.value = scoutId;
      }
    });

    console.log(`SIM-SDK: Updated ${inputs.length} hidden fields.`);
    return inputs.length;
  }

  /**
   * Tracks a conversion event (e.g., form submission, purchase).
   * Sends data to the 'tracking_events' table in Supabase.
   * @param {string} conversionName - The name of the conversion event (e.g., 'lead_submission', 'checkout').
   * @param {object} [additionalMeta={}] - Optional metadata to store with the event.
   * @returns {Promise<object>} The result of the Supabase insert operation.
   */
  async trackConversion(conversionName, additionalMeta = {}) {
    const scoutId = this.getScoutId();
    
    // Even if no scoutId, we might want to track organic conversions if requirements change.
    // But currently, the system focuses on attributed conversions.
    
    const payload = {
      scout_id: scoutId || null, // Null allowed for organic conversions (visible via recent RLS fix)
      event_type: 'conversion',
      meta_data: { 
        conversion_name: conversionName,
        ...additionalMeta 
      }
    };

    try {
      const { data, error } = await this.supabase
        .from('tracking_events')
        .insert(payload)
        .select();

      if (error) throw error;
      
      console.log(`SIM-SDK: Conversion '${conversionName}' tracked.`, data);
      return { success: true, data };
    } catch (err) {
      console.error('SIM-SDK: Conversion tracking failed', err);
      return { success: false, error: err };
    }
  }
  
  /**
   * Internal helper to track generic page views.
   * @param {string} [campaignId] - Optional campaign ID.
   * @returns {Promise<void>}
   */
  async trackPageView(campaignId = null) {
      const scoutId = this.getScoutId();
      // Track page view even if organic (scoutId is null)
      
      try {
          await this.supabase.from('tracking_events').insert({
              scout_id: scoutId || null,
              event_type: 'page_view',
              meta_data: { campaign_id: campaignId }
          });
          console.log('SIM-SDK: Page View Tracked');
      } catch (e) {
          console.warn('SIM-SDK: Tracking failed', e);
      }
  }
}

// Instantiate and expose globally
window.SimScouting = new SimScoutingSDK();


/**
 * Web Component: <sim-scouting-widget>
 * Displays the lead capture form and handles submission.
 * Uses window.SimScouting for tracking logic.
 */
class SimScoutingWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.supabase = window.SimScouting.supabase; // Reuse client from SDK
  }

  connectedCallback() {
    this.render();
    
    // Use SDK to track page view
    const campaignId = this.getAttribute('campaign-id');
    window.SimScouting.trackPageView(campaignId);
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
    // const successMsg = this.shadowRoot.getElementById('success-msg'); // Not used directly, cleared by innerHTML replacement

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

        // 2. Get Scout ID from SDK
        let scoutId = window.SimScouting.getScoutId();
        // 3. Get Source
        const source = window.SimScouting.getSource();
        
        // Debug override for localhost (if no stored ID)
        if (!scoutId && window.location.hostname === 'localhost') scoutId = '0e13eb93-b8fa-4801-a800-13a4ce596be2';

        const payload = {
          campaign_id: campaignId || null, 
          scout_id: scoutId || null,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          lead_data: { 
              first_name: firstName, 
              last_name: lastName, 
              phone: phone,
              source: source || 'direct' 
          },
          status: 'pending'
        };

        const { error } = await this.supabase
            .from('invites')
            .insert(payload);

        if (error) throw error;
        
        // Also track conversion event
        await window.SimScouting.trackConversion('lead_form_submit', { campaign_id: campaignId });

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
