import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    targetType:{
        type: String,
        enum: ['vendor', 'planner', 'venue'],
        required: true,
    },
    rating:{
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment:{
        type: String,
        default: '',
    }
},{timestamps: true});

export const Review = mongoose.model('Review', reviewSchema);
export default Review;