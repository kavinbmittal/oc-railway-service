const BASE = "/mc/api";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function getProjects() {
  const data = await fetchJSON(`${BASE}/projects`);
  return data.projects || [];
}

export async function getDashboard() {
  return fetchJSON(`${BASE}/dashboard`);
}

export async function getFile(filePath) {
  const data = await fetchJSON(`${BASE}/files?path=${encodeURIComponent(filePath)}`);
  return data;
}
