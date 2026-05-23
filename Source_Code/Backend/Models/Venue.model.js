import mongoose from "mongoose";
const venueSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    capacity: {
        type : Number,
        required: true,
    },
    features:[{
        type: String,
    }],
    location: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    images: [{
        type: String,
    }],
    destinationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination',
    },
    availableDates: [{
        type: Date,
    }],
},{timestamps: true});

export const Venue = mongoose.model('Venue', venueSchema);
export default Venue;
