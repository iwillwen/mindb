export class memStore {
  get(key) {
    if (sessionStorage) {
      return sessionStorage.getItem(key);
    } else {
      return false;
    }
  }

  set(key, value) {
    if (sessionStorage) {
      return sessionStorage.setItem(key, value);
    } else {
      return false;
    }
  }

  remove(key) {
    if (sessionStorage) {
      return sessionStorage.removeItem(key);
    } else {
      return false;
    }
  }
}

export class localStore {
  get(key) {
    if (localStorage) {
      return localStorage.getItem(key);
    } else {
      return false;
    }
  }

  set(key, value) {
    if (localStorage) {
      return localStorage.setItem(key, value);
    } else {
      return false;
    }
  }

  remove(key) {
    if (localStorage) {
      return localStorage.removeItem(key);
    } else {
      return false;
    }
  }
}