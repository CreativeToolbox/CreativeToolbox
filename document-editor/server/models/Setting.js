const settingSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  name: String,
  location: String,
  geography: String,
  timePeriod: String,
  description: String
}); 