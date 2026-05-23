import mongoose from 'mongoose';
const WeddingPlanSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    destination:{
        type: String,
        required: true
    },
    packageId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
    },
    customServices:{
        type: [String],
        default: []
    },
    budget:{
        type: Number,
        required: true
    },
    vendorSelection:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    guestDetails:{
        type: [{
            name: String,
            relation: String,
            contact: String
        }],
        default: []
    },
    weddingDate:{
        type: Date,
        required: true
    },
    status:{
        type: String,
        enum: ['Planning', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Planning',
    }
},{timestamps: true});
const WeddingPlan=mongoose.model("WeddingPlan",WeddingPlanSchema);
export default WeddingPlan