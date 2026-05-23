import mongoose from "mongoose";
const packageSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    servicesIncluded: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
    }],
    basePrice:{
        type: Number,
        required: true,
    },
    customizable:{
        type: Boolean,
        default: true,
    },
    description: {
        type: String,
        default: '',
    },
    destinationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination',
    },
    image: {
        type: String,
    },
},{timestamps: true});

export const Package = mongoose.model('Package', packageSchema);
export default Package;