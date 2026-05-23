import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount:{
        type: Number,
        required: true,
    },
    bookingId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
    },
    status:{
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        required: true,
        default: 'pending',
    },
    method: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'paypal', 'cash', 'other'],
        required: true,
    },
    invoiceUrl: {
        type: String,
        default: '',
    },
    transactionId: {
        type: String,
        default: '',
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
},{timestamps: true});

export const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;