import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const LOCAL_DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_DIR = isServerless ? '/tmp/chatbot-data' : LOCAL_DATA_DIR;

const NEGOCIOS_FILE = path.join(DATA_DIR, 'negocios.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

async function ensureFiles() {
  try {
    await fsp.mkdir(DATA_DIR, { recursive: true });

    // Seed negocios.json if in /tmp
    if (!fs.existsSync(NEGOCIOS_FILE)) {
      const sourceNegocios = path.join(LOCAL_DATA_DIR, 'negocios.json');
      if (fs.existsSync(sourceNegocios)) {
        await fsp.copyFile(sourceNegocios, NEGOCIOS_FILE);
      } else {
        await fsp.writeFile(NEGOCIOS_FILE, '{}\n');
      }
    }

    if (!fs.existsSync(LEADS_FILE)) {
      const sourceLeads = path.join(LOCAL_DATA_DIR, 'leads.json');
      if (fs.existsSync(sourceLeads)) {
        await fsp.copyFile(sourceLeads, LEADS_FILE);
      } else {
        await fsp.writeFile(LEADS_FILE, '[]\n');
      }
    }
  } catch (err) {
    // Non-fatal if read-only
  }
}

let cachedNegocios = null;

export async function getNegocios() {
  await ensureFiles();
  try {
    const raw = await fsp.readFile(NEGOCIOS_FILE, 'utf-8');
    cachedNegocios = JSON.parse(raw || '{}');
    return cachedNegocios;
  } catch (err) {
    if (cachedNegocios) return cachedNegocios;
    // Fallback to local data dir if exists
    try {
      const fallbackRaw = await fsp.readFile(path.join(LOCAL_DATA_DIR, 'negocios.json'), 'utf-8');
      return JSON.parse(fallbackRaw || '{}');
    } catch {
      return {};
    }
  }
}

export async function getNegocioById(id) {
  const all = await getNegocios();
  return all[id] || null;
}

export async function saveNegocio(id, negocioData) {
  const all = await getNegocios();
  all[id] = negocioData;
  cachedNegocios = all;
  await ensureFiles();
  try {
    await fsp.writeFile(NEGOCIOS_FILE, JSON.stringify(all, null, 2));
  } catch (err) {
    console.warn('Storage write notice:', err.message);
  }
  return all[id];
}

export async function getLeads(projectId = null) {
  await ensureFiles();
  try {
    const raw = await fsp.readFile(LEADS_FILE, 'utf-8');
    const parsed = JSON.parse(raw || '[]');
    if (projectId) {
      return parsed.filter(l => l.projectId === projectId);
    }
    return parsed;
  } catch (err) {
    return [];
  }
}

export async function saveLead(leadData) {
  await ensureFiles();
  const leads = await getLeads();
  const newLead = {
    id: `LEAD-${Date.now().toString(36).toUpperCase()}`,
    fecha: new Date().toISOString(),
    ...leadData
  };
  leads.unshift(newLead);
  try {
    await fsp.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
  } catch (err) {
    console.warn('Could not write lead to disk:', err.message);
  }
  return newLead;
}
