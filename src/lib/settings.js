import db from "./db";

// Simple in-memory cache to prevent excessive DB calls
let settingsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000; // 60 seconds

const DEFAULT_SETTINGS = {
  brand_name: "THE LUXURY",
  brand_description: "Exclusive Limited Edition Timepieces and Accessories.",
  email_address: "support@gmail.com",
  helpline_number: "0300000000",
  whatsapp_number: "0300000000",
  facebook_url: "https://facebook.com",
  instagram_url: "https://instagram.com",
  tiktok_url: "https://tiktok.com",
  snapchat_url: "https://snapchat.com",
  logo_url: "",
  domain_name: "",
};

// Function to GET settings
export async function getSiteSettings() {
  const now = Date.now();

  // Return cached version if valid
  if (settingsCache && (now - lastFetchTime < CACHE_DURATION)) {
    return { ...DEFAULT_SETTINGS, ...settingsCache };
  }

  try {
    const [rows] = await db.query('SELECT * FROM site_settings WHERE id = 1');
    const data = rows.length > 0 ? rows[0] : {};

    // Update cache
    settingsCache = data;
    lastFetchTime = now;

    return { ...DEFAULT_SETTINGS, ...data };
  } catch (error) {
    console.error("Database Error (getSiteSettings):", error);
    return DEFAULT_SETTINGS;
  }
}



// Function to UPDATE settings
export async function updateSiteSettings(data) {
  const sql = `
    UPDATE site_settings 
    SET 
      brand_name = ?, brand_description = ?, logo_url = ?, email_address = ?, 
      helpline_number = ?, whatsapp_number = ?, 
      facebook_url = ?, instagram_url = ?, tiktok_url = ?, snapchat_url = ?,
      domain_name = ?
    WHERE id = 1
  `;

  const values = [
    data.brand_name || '',
    data.brand_description || '',
    data.logo_url || '',
    data.email_address || '',
    data.helpline_number || '',
    data.whatsapp_number || '',
    data.facebook_url || '',
    data.instagram_url || '',
    data.tiktok_url || '',
    data.snapchat_url || '',
    data.domain_name || ''
  ];

  try {
    const [result] = await db.query(sql, values);
    settingsCache = null; // Invalidate cache on update
    return result;
  } catch (error) {
    console.error("Database Error (updateSiteSettings):", error);
    throw error;
  }
}