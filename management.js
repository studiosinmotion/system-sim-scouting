import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://rmtyebyzitzgkplxvzxg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2qDg3Jssg_fTPdXl_3Ku-g_1yOkdJ3i';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const AUTH_KEY = 'sim_mgmt_auth';
let tenantsData = [];
let scoutCounts = {};
let leadCounts = {};
let rewardCounts = {};
let rewardsForTenant = [];

// ── AUTH ──
function showApp() {
    document.getElementById('auth-layer').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
}

window.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem(AUTH_KEY) === 'ok') {
        showApp();
        loadAll();
    } else {
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = document.getElementById('login-password').value;
            if (pass === 'admin123') {
                sessionStorage.setItem(AUTH_KEY, 'ok');
                showApp();
                loadAll();
            } else {
                document.getElementById('login-error').classList.remove('hidden');
                document.getElementById('login-password').value = '';
            }
        });
    }
});

window.handleLogout = function() {
    sessionStorage.removeItem(AUTH_KEY);
    location.reload();
};

// ── LOAD ALL DATA ──
async function loadAll() {
    try {
        // 1. Tenants
        const { data: tenants } = await supabase.from('tenants').select('*').order('name');
        tenantsData = tenants || [];

        // 2. Scout counts per tenant
        const { data: scouts } = await supabase.from('scouts').select('id, tenant_id');
        scoutCounts = {};
        (scouts || []).forEach(s => { scoutCounts[s.tenant_id] = (scoutCounts[s.tenant_id] || 0) + 1; });

        // 3. Lead counts: invites → scout → tenant
        const scoutTenantMap = {};
        (scouts || []).forEach(s => { scoutTenantMap[s.id] = s.tenant_id; });

        const { data: invites } = await supabase.from('invites').select('id, scout_id');
        leadCounts = {};
        (invites || []).forEach(inv => {
            const tid = scoutTenantMap[inv.scout_id];
            if (tid) leadCounts[tid] = (leadCounts[tid] || 0) + 1;
        });

        // 4. Reward counts per tenant
        const { data: rewards } = await supabase.from('rewards').select('id, tenant_id, is_active');
        rewardCounts = {};
        let activeRewards = 0;
        (rewards || []).forEach(r => {
            rewardCounts[r.tenant_id] = (rewardCounts[r.tenant_id] || 0) + 1;
            if (r.is_active) activeRewards++;
        });

        // KPIs
        document.getElementById('kpi-tenants').textContent = tenantsData.length;
        document.getElementById('kpi-scouts').textContent = (scouts || []).length;
        document.getElementById('kpi-leads').textContent = (invites || []).length;
        document.getElementById('kpi-rewards').textContent = activeRewards;

        renderTenants();
    } catch (err) {
        console.error('Load error:', err);
    }
}

// ── RENDER TENANTS TABLE ──
function renderTenants() {
    const tbody = document.getElementById('tenants-body');
    if (tenantsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-500">Keine Tenants vorhanden</td></tr>';
        return;
    }

    tbody.innerHTML = tenantsData.map(t => {
        const sc = scoutCounts[t.id] || 0;
        const lc = leadCounts[t.id] || 0;
        const rc = rewardCounts[t.id] || 0;
        const statusBadge = {
            active: '<span class="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Aktiv</span>',
            paused: '<span class="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Pausiert</span>',
            cancelled: '<span class="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">Gekündigt</span>'
        }[t.status || 'active'] || '<span class="text-xs px-2 py-0.5 rounded bg-slate-500/20 text-slate-400">–</span>';

        const logoImg = t.logo_url
            ? `<img src="${t.logo_url}" alt="" class="h-8 w-8 rounded-lg object-cover bg-slate-800">`
            : '<div class="h-8 w-8 rounded-lg bg-slate-700 flex items-center justify-center"><i class="fa-solid fa-building text-slate-500 text-xs"></i></div>';

        return `<tr class="border-b border-slate-700/50 hover:bg-slate-800/30 transition cursor-pointer" onclick="openTenantModal('${t.id}')">
            <td class="p-3">${logoImg}</td>
            <td class="p-3 font-medium text-white">${t.name}</td>
            <td class="p-3 text-slate-400 text-xs">${t.email || '–'}</td>
            <td class="p-3 text-slate-400">${t.contact_person || '–'}</td>
            <td class="p-3 text-center"><span class="font-mono">${sc}</span></td>
            <td class="p-3 text-center"><span class="font-mono">${lc}</span></td>
            <td class="p-3 text-center"><span class="font-mono">${rc}</span></td>
            <td class="p-3 text-center">${statusBadge}</td>
            <td class="p-3 text-right">
                <button onclick="event.stopPropagation(); openTenantModal('${t.id}')" class="text-slate-400 hover:text-white transition p-1" title="Bearbeiten">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
            </td>
        </tr>`;
    }).join('');
}

// ── TENANT MODAL ──
window.openTenantModal = async function(tenantId) {
    const modal = document.getElementById('tenant-modal');
    const isEdit = !!tenantId;

    document.getElementById('tenant-modal-title').textContent = isEdit ? 'Tenant bearbeiten' : 'Neuer Tenant';
    document.getElementById('rewards-section').classList.toggle('hidden', !isEdit);

    // Reset form
    ['tf-id','tf-name','tf-email','tf-contact','tf-phone','tf-website','tf-address','tf-logo'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('tf-status').value = 'active';

    if (isEdit) {
        const t = tenantsData.find(x => x.id === tenantId);
        if (t) {
            document.getElementById('tf-id').value = t.id;
            document.getElementById('tf-name').value = t.name || '';
            document.getElementById('tf-email').value = t.email || '';
            document.getElementById('tf-contact').value = t.contact_person || '';
            document.getElementById('tf-phone').value = t.phone || '';
            document.getElementById('tf-website').value = t.website || '';
            document.getElementById('tf-address').value = t.address || '';
            document.getElementById('tf-logo').value = t.logo_url || '';
            document.getElementById('tf-status').value = t.status || 'active';
        }
        await loadRewards(tenantId);
    } else {
        document.getElementById('rewards-list').innerHTML = '<p class="text-sm text-slate-500 text-center py-2">Speichere den Tenant zuerst, um Belohnungen hinzuzufügen</p>';
    }

    modal.classList.remove('hidden');
};

window.closeTenantModal = function() {
    document.getElementById('tenant-modal').classList.add('hidden');
};

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTenantModal(); });

// ── SAVE TENANT ──
window.saveTenant = async function() {
    const id = document.getElementById('tf-id').value;
    const payload = {
        name: document.getElementById('tf-name').value.trim(),
        email: document.getElementById('tf-email').value.trim(),
        contact_person: document.getElementById('tf-contact').value.trim() || null,
        phone: document.getElementById('tf-phone').value.trim() || null,
        website: document.getElementById('tf-website').value.trim() || null,
        address: document.getElementById('tf-address').value.trim() || null,
        logo_url: document.getElementById('tf-logo').value.trim() || null,
        status: document.getElementById('tf-status').value
    };

    if (!payload.name) return alert('Name ist ein Pflichtfeld!');
    if (!payload.email) return alert('E-Mail ist ein Pflichtfeld!');

    try {
        if (id) {
            const { error } = await supabase.from('tenants').update(payload).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('tenants').insert(payload);
            if (error) throw error;
        }
        closeTenantModal();
        await loadAll();
    } catch (err) {
        alert('Fehler beim Speichern: ' + err.message);
        console.error(err);
    }
};

// ── REWARDS ──
async function loadRewards(tenantId) {
    const { data, error } = await supabase.from('rewards').select('*').eq('tenant_id', tenantId).order('created_at');
    if (error) { console.error(error); return; }
    rewardsForTenant = data || [];
    renderRewards(tenantId);
}

function renderRewards(tenantId) {
    const container = document.getElementById('rewards-list');
    if (rewardsForTenant.length === 0) {
        container.innerHTML = '<p class="text-sm text-slate-500 text-center py-2">Keine Belohnungen angelegt</p>';
        return;
    }

    container.innerHTML = rewardsForTenant.map(r => {
        const activeBadge = r.is_active
            ? '<span class="text-xs text-emerald-400">Aktiv</span>'
            : '<span class="text-xs text-slate-500">Inaktiv</span>';

        return `<div class="reward-card bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-start justify-between gap-3 transition">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <i class="fa-solid fa-gift text-amber-400 text-sm"></i>
                    <span class="font-semibold text-sm">${r.title}</span>
                    ${activeBadge}
                </div>
                <p class="text-xs text-slate-400">${r.description || 'Keine Beschreibung'}</p>
                ${r.value_amount ? `<p class="text-xs text-slate-300 mt-1 font-mono">${r.value_amount} ${r.value_unit || 'EUR'}</p>` : ''}
            </div>
            <div class="flex gap-1">
                <button onclick="toggleReward('${r.id}', ${!r.is_active})" class="p-1.5 hover:bg-slate-700 rounded transition" title="${r.is_active ? 'Deaktivieren' : 'Aktivieren'}">
                    <i class="fa-solid fa-${r.is_active ? 'pause' : 'play'} text-slate-400 text-xs"></i>
                </button>
                <button onclick="deleteReward('${r.id}')" class="p-1.5 hover:bg-red-900/30 rounded transition" title="Löschen">
                    <i class="fa-solid fa-trash text-red-400/60 text-xs"></i>
                </button>
            </div>
        </div>`;
    }).join('');
}

window.addRewardRow = async function() {
    const tenantId = document.getElementById('tf-id').value;
    if (!tenantId) return alert('Bitte den Tenant zuerst speichern.');

    const title = prompt('Titel der Belohnung (z.B. "150€ Amazon-Gutschein"):');
    if (!title) return;

    const description = prompt('Beschreibung (optional):') || '';
    const amountStr = prompt('Wert in EUR (z.B. 150):') || '';
    const value_amount = amountStr ? parseFloat(amountStr) : null;

    try {
        const { error } = await supabase.from('rewards').insert({
            tenant_id: tenantId,
            title,
            description,
            value_amount,
            value_unit: 'EUR',
            is_active: true
        });
        if (error) throw error;
        await loadRewards(tenantId);
    } catch (err) {
        alert('Fehler: ' + err.message);
    }
};

window.toggleReward = async function(rewardId, newState) {
    const tenantId = document.getElementById('tf-id').value;
    await supabase.from('rewards').update({ is_active: newState }).eq('id', rewardId);
    await loadRewards(tenantId);
};

window.deleteReward = async function(rewardId) {
    if (!confirm('Belohnung wirklich löschen?')) return;
    const tenantId = document.getElementById('tf-id').value;
    await supabase.from('rewards').delete().eq('id', rewardId);
    await loadRewards(tenantId);
};
