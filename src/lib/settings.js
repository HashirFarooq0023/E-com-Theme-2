import db from "./db";



const DEFAULT_SETTINGS = {
  brand_name: "THE LUXURY",
  brand_description: "Exclusive Limited Edition Timepieces and Accessories.",
  email_address: "support@gmail.com",
  helpline_number: "0300000000",
  whatsapp_number: "0300000000",
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  snapchat_url: "",
  logo_url: "",
  domain_name: "",
};

import { cache } from 'react';

let settingsCache = null;
let settingsCacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

// Function to GET settings (Cached per request & memory)
export const getSiteSettings = cache(async () => {
  const now = Date.now();
  if (settingsCache && (now - settingsCacheTime < CACHE_TTL)) {
    return settingsCache;
  }
  try {
    const [rows] = await db.query('SELECT * FROM site_settings WHERE id = 1');
    const data = rows.length > 0 ? rows[0] : {};
    settingsCache = { ...DEFAULT_SETTINGS, ...data };
    settingsCacheTime = now;
    return settingsCache;
  } catch (error) {
    console.error("Database Error (getSiteSettings):", error);
    return settingsCache || DEFAULT_SETTINGS;
  }
});



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
    settingsCacheTime = 0;
    return result;
  } catch (error) {
    console.error("Database Error (updateSiteSettings):", error);
    throw error;
  }
}