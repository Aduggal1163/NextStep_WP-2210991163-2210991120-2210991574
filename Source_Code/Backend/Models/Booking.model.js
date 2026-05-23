import mongoose from "mongoose";
const bookingSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    plannerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Planner',
    },
    packageId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
    },
    date:{
        type: Date,
        required: true,
    },
    status:{
        type: String,
        required: true,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending',
    },
    customRequests:{
        type: String,
        default: '',
    },
    vendors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    }],
    destinationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Destination',
        required: true,
    },
    guestDetailsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GuestDetails',
    },
    totalAmount: {
        type: Number,
        default: 0,
    },
    customizationRequests: {
        type: String,
        default: '',
    },
    customizationResponse: {
        type: String,
        default: '',
    },
    customizationStatus: {
        type: String,
        enum: ['pending', 'reviewed', 'approved', 'rejected'],
        default: 'pending',
    },
    suggestedVendors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    }],
    vendorDeliverables: [{
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
        },
        deliverables: [String],
        status: String,
        notes: String,
        uploadedAt: Date,
    }],
    vendorInvoices: [{
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
        },
        amount: Number,
        description: String,
        invoiceUrl: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        submittedAt: Date,
    }],
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;