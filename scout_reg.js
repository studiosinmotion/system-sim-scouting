class SimScoutRegister extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.supabaseUrl = this.getAttribute('supabase-url');
        this.supabaseKey = this.getAttribute('supabase-key');
        this.tenantId = this.getAttribute('tenant-id');
        this.targetUrl = this.getAttribute('target-url');

        if (!this.supabaseUrl || !this.supabaseKey || !this.tenantId || !this.targetUrl) {
            console.error('SIM-SCOUT-REGISTER: Missing required attributes.');
            this.shadowRoot.innerHTML = '<p style="color:red; font-family:sans-serif;">Error: Missing configuration.</p>';
            return;
        }

        this.ensureSupabaseLoaded();
        this.render();
    }

    async ensureSupabaseLoaded() {
        if (window.supabase) return; // Already loaded

        // Check if script tag exists
        if (!document.querySelector('script[src*="supabase-js"]')) {
            const script = document.createElement('script');
            script.type = 'module';
            // We use a small inline module shim to expose createClient globally if needed, 
            // but since we are inside a module environment usually, we might need a different approach.
            // Simplified: We load from esm.sh and attach to window for this specific use case if possible 
            // or just import it dynamically in the logic.
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    --primary-color: #00b4d8;
                    --primary-hover: #0096b4;
                    --bg-color: #ffffff;
                    --text-color: #333333;
                    --input-bg: #f9f9f9;
                    --input-border: #e0e0e0;
                    --radius: 12px;
                }

                .container {
                    background: var(--bg-color);
                    border: 1px solid var(--input-border);
                    border-radius: var(--radius);
                    padding: 2rem;
                    max-width: 400px;
                    margin: 0 auto;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                }

                h2 {
                    margin: 0 0 1rem 0;
                    font-size: 1.5rem;
                    color: var(--text-color);
                    text-align: center;
                    font-weight: 700;
                }

                form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #666;
                }

                input {
                    padding: 0.8rem 1rem;
                    border: 1px solid var(--input-border);
                    border-radius: 8px;
                    font-size: 1rem;
                    background: var(--input-bg);
                    transition: all 0.2s ease;
                }

                input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.1);
                }

                button {
                    margin-top: 0.5rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 1rem;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.2s ease, transform 0.1s ease;
                }

                button:hover {
                    background: var(--primary-hover);
                }

                button:active {
                    transform: translateY(1px);
                }

                button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .error {
                    color: #e63946;
                    font-size: 0.85rem;
                    text-align: center;
                    margin-top: 0.5rem;
                    display: none;
                }
            </style>

            <div class="container">
                <h2>Werde Scout & trainiere gratis</h2>
                <form id="scout-form">
                    <div class="form-group">
                        <label for="first_name">Vorname</label>
                        <input type="text" id="first_name" name="first_name" placeholder="Max" required>
                    </div>
                    <div class="form-group">
                        <label for="last_name">Nachname</label>
                        <input type="text" id="last_name" name="last_name" placeholder="Mustermann" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Deine E-Mail</label>
                        <input type="email" id="email" name="email" placeholder="max@beispiel.de" required>
                    </div>
                    
                    <button type="submit" id="submit-btn">Jetzt anmelden</button>
                    <div class="error" id="error-msg"></div>
                </form>
            </div>
        `;

        this.shadowRoot.getElementById('scout-form').addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const btn = this.shadowRoot.getElementById('submit-btn');
        const errorMsg = this.shadowRoot.getElementById('error-msg');
        const firstName = this.shadowRoot.getElementById('first_name').value;
        const lastName = this.shadowRoot.getElementById('last_name').value;
        const email = this.shadowRoot.getElementById('email').value;

        btn.disabled = true;
        btn.textContent = 'Lädt...';
        errorMsg.style.display = 'none';

        try {
            // Dynamically import Supabase here to avoid global namespace pollution / requirement
            const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
            
            const supabase = createClient(this.supabaseUrl, this.supabaseKey);

            const { data, error } = await supabase
                .from('scouts')
                .insert({
                    tenant_id: this.tenantId,
                    tenant_id: this.tenantId,
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    stats: {}
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                // Success! Redirect.
                const redirectUrl = new URL(this.targetUrl);
                redirectUrl.searchParams.set('id', data.id);
                window.location.href = redirectUrl.toString();
            } else {
                throw new Error('Keine ID zurückerhalten.');
            }

        } catch (err) {
            console.error(err);
            errorMsg.textContent = 'Fehler: ' + (err.message || 'Verbindung fehlgeschlagen');
            errorMsg.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Jetzt anmelden';
        }
    }
}

customElements.define('sim-scout-register', SimScoutRegister);
