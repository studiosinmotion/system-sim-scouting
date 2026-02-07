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
    // Collect params from both search and hash (for robustness)
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#\/?/, '')); // Handle #/foo?bar or #bar
    
    // Helper to get from either source
    const getParam = (key) => urlParams.get(key) || hashParams.get(key);

    const newScoutId = getParam('ref') || getParam('scout_id') || getParam('referrer');
    const newSource = getParam('source');
    
    // Campaign: Check standard, utm, and capitalized versions
    const newCampaign = getParam('campaign') || getParam('utm_campaign') || getParam('Campaign'); 

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

    if (newCampaign) { // Added Campaign Storage
      localStorage.setItem('sim_scout_campaign', newCampaign);
      console.log('SIM-SDK: Campaign saved:', newCampaign);
    } else {
        // Debug: Log complete check if campaign missing
        console.log('SIM-SDK: No campaign found in URL.', { search: window.location.search, hash: window.location.hash });
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
   * Retrieves the currently stored Campaign.
   * @returns {string|null} 
   */
  getCampaign() { // Added Campaign Getter
      return localStorage.getItem('sim_scout_campaign'); 
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
    
    // Enrich with Source & Campaign
    const source = this.getSource();
    if (source) additionalMeta.source = source;

    const campaign = this.getCampaign(); // Added Campaign Enrichment
    if (campaign) additionalMeta.campaign = campaign;

    if (!scoutId) {
      console.warn('SIM-SDK: No Scout ID found. Conversion not tracked linked to a scout.');
      // Optional: Track organic conversions?
      // return; 
    }

    console.log(`SIM-SDK: Tracking conversion '${conversionName}' for Scout ${scoutId || 'Organic'}`);

    try {
      const { data, error } = await this.supabase
        .from('tracking_events')
        .insert({
          scout_id: scoutId || null, // Allow null for organic
          event_type: 'conversion',
          meta_data: { conversion_name: conversionName, ...additionalMeta }
        });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('SIM-SDK: Conversion tracking failed:', err);
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


// --- WEB COMPONENT: <sim-scouting-widget> ---
class SimScoutingWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.supabase = window.SimScouting.supabase; // Reuse client from SDK
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  render() {
    // Styles (Tailwind-like minimal setup)
    const style = `
      <style>
        :host {
          display: block;
          font-family: 'Inter', sans-serif;
          max-width: 400px;
          margin: 0 auto;
        }
        .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 24px;
          border: 1px solid #e5e7eb;
        }
        .title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 1.5rem;
        }
        .input-group {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.25rem;
        }
        input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          font-size: 0.875rem;
          box-sizing: border-box;
        }
        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        button {
          width: 100%;
          background-color: #2563eb;
          color: white;
          font-weight: 600;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        button:hover {
          background-color: #1d4ed8;
        }
        button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
        .success-message {
          display: none;
          text-align: center;
          color: #059669;
        }
        .scout-info {
           margin-top: 1rem;
           font-size: 0.75rem;
           color: #9ca3af;
           text-align: center;
        }
      </style>
    `;

    this.shadowRoot.innerHTML = `
      ${style}
      <div class="card">
        <div id="form-view">
          <h2 class="title">Interesse geweckt?</h2>
          <p class="subtitle">Hinterlasse deine Kontaktdaten und wir melden uns bei dir!</p>
          
          <form id="lead-form">
            <div class="input-group">
              <label for="fname">Vorname</label>
              <input type="text" id="fname" name="fname" required placeholder="Max">
            </div>
            
            <div class="input-group">
              <label for="lname">Nachname</label>
              <input type="text" id="lname" name="lname" required placeholder="Mustermann">
            </div>
            
            <div class="input-group">
              <label for="phone">Telefonnummer</label>
              <input type="tel" id="phone" name="phone" required placeholder="0170 12345678">
            </div>

            <button type="submit" id="submit-btn">Jetzt absenden</button>
            <div class="scout-info" id="scout-info"></div>
          </form>
        </div>

        <div id="success-view" class="success-message">
          <h2 class="title">Vielen Dank!</h2>
          <p class="subtitle">Wir haben deine Daten erhalten und melden uns in Kürze.</p>
          <svg style="width: 64px; height: 64px; margin: 0 auto; color: #059669;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
    `;
    
    // Check if Scout is referencing
    const scoutId = window.SimScouting.getScoutId();
    if (scoutId) {
        // Optional: Fetch Scout Name via API if you want to display "Recommended by..."
        // For now just logging or showing ID (debugging)
        const infoEl = this.shadowRoot.getElementById('scout-info');
        // infoEl.textContent = `Ref: ${scoutId}`; // Uncomment to show Ref ID in UI
    }
  }

  setupListeners() {
    const form = this.shadowRoot.getElementById('lead-form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    const btn = this.shadowRoot.getElementById('submit-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Sende...';
    btn.disabled = true;

    const fname = this.shadowRoot.getElementById('fname').value;
    const lname = this.shadowRoot.getElementById('lname').value;
    const phone = this.shadowRoot.getElementById('phone').value;
    
    const scoutId = window.SimScouting.getScoutId();
    const source = window.SimScouting.getSource();
    const campaign = window.SimScouting.getCampaign(); // Added Campaign

    // Campaign ID from Supabase? 
    // Usually, we just insert into 'invites' table. If you have a specific 'campaigns' table (SQL), 
    // you might need a UUID. 
    // For this simple setup, we treat 'campaign' in the URL as a text tag, not a foreign key UUID.
    // If your DB expects a UUID for `campaign_id` column, you must provide it.
    // However, if we don't have a valid UUID for the campaign, we MUST send null to avoid FK violation.
    // The text-based campaign name (e.g. 'newsletter') goes into lead_data.
    
    // Check if attribute 'campaign-id' is a valid UUID (simple regex check)
    const campaignIdAttr = this.getAttribute('campaign-id');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignIdAttr);
    const campaignId = isUuid ? campaignIdAttr : null;

    const payload = {
      campaign_id: campaignId,
      scout_id: scoutId || null,
      first_name: fname,
      last_name: lname,
      phone: phone,
      lead_data: { 
          first_name: fname, 
          last_name: lname, 
          phone: phone,
          source: source || 'direct',
          campaign: campaign || null // Added Campaign to Payload
      },
      status: 'pending'
    };

    try {
        // 1. Insert into Invites (Leads)
        const { error } = await window.SimScouting.supabase
            .from('invites')
            .insert(payload);

        if (error) throw error;

        // 2. Track Custom Event
        await window.SimScouting.trackConversion('lead_form_submit', { 
            name: `${fname} ${lname}`,
            source: source,
            campaign: campaign // Track campaign in event meta too
        });

        // Show Success
        this.shadowRoot.getElementById('form-view').style.display = 'none';
        this.shadowRoot.getElementById('success-view').style.display = 'block';

    } catch (err) {
        console.error('Submission failed', err);
        alert('Fehler beim Senden. Bitte versuche es später.');
        btn.textContent = originalText;
        btn.disabled = false;
    }
  }
}

customElements.define('sim-scouting-widget', SimScoutingWidget);
