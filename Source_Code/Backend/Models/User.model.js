import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
        minLength: 8,
        maxLength: 100,
    },
    contactDetails:{
        type:Number,
        required: true,
        minLength: 10
    },
    role:{
        type: String,
        enum:['user','admin','planner','vendor'],
        default: 'user',
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    isSuspended: {
        type: Boolean,
        default: false,
    },
    weddingPlan:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WeddingPlan',
    },
    reviews:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
    }],
},{timestamps: true});
const User = mongoose.model('User', userSchema);
export default User;