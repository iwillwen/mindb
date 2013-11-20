// For Adobe AIR EncryptedLocalStore
function EncryptedLocalStore() {}
EncryptedLocalStore.prototype.get = function(key) {
  return air.EncryptedLocalStore.getItem(key);
};
EncryptedLocalStore.prototype.set = function(key, value) {
  return air.EncryptedLocalStore.setItem(key, value);
};
EncryptedLocalStore.prototype.remove = function(key) {
  return air.EncryptedLocalStore.removeItem(key);
};