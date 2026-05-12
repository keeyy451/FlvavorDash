module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [], // Kosongkan karena sudah otomatis di-handle oleh preset Expo Anda
  };
};
