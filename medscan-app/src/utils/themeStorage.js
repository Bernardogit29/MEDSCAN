const KEY = 'medscan.appearance';
export async function readTheme() { return localStorage.getItem(KEY); }
export async function writeTheme(mode) { localStorage.setItem(KEY, mode); }
