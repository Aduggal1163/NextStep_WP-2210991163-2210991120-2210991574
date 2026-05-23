import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  guestList: [
    {
      name: {
        type: String,
        required: true,
      },
      age: Number,
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
      },
      mealPreference: {
        type: String,
        enum: ['Veg', 'Non-Veg', 'Vegan', 'Jain'],
        default: 'Veg',
      },
      roomPreference: {
        type: String,
        enum: ['Single', 'Double', 'Suite'],
        default: 'Double',
      },
      specialNeeds: {
        type: String,
      },
    }
  ],
  totalGuests: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true
});

const GuestDetails = mongoose.model('GuestDetails', guestSchema);

export default GuestDetails;
