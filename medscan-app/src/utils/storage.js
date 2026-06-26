export async function getStoredItem(key) {
  if (typeof localStorage === "undefined") {
    return null;
  }

  return localStorage.getItem(key);
}

export async function setStoredItem(key, value) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(key, value);
}

export async function removeStoredItem(key) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.removeItem(key);
}
