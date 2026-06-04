const mongoose = require('mongoose');

const globalSettingSchema = new mongoose.Schema({
  isTrainingPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GlobalSetting', globalSettingSchema);
