import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  style: {
    type: String,
    enum:['beach', 'palace', 'hill station', 'traditional', 'modern'],
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  images: [{
    type: String,
  }],
  guestCapacity: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  availableDates: {
    type: [Date],
    default: [],
  },
  priceRange: {
    type: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    required: true,
  },
  venues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
  }],
}, { timestamps: true });

const Destination = mongoose.model('Destination', destinationSchema);
export default Destination;
