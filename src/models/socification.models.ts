import mongoose from "mongoose";

// 1. Notification Preference Schema
const notificationPreferenceSchema = new mongoose.Schema({
    userId: {
        type: String, // clerkId of the user
        required: true,
        unique: true,
        index: true
    },
    channels: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: true }
    },
    types: {
        social: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
        music: { type: Boolean, default: true },
        ai: { type: Boolean, default: true },
        system: { type: Boolean, default: true }
    }
}, { timestamps: true });

// 2. Notification Template Schema
const notificationTemplateSchema = new mongoose.Schema({
    templateId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    titleTemplate: {
        type: String,
        required: true
    },
    bodyTemplate: {
        type: String,
        required: true
    }
}, { timestamps: true });

// 3. Notification Delivery Log Schema
const notificationDeliveryLogSchema = new mongoose.Schema({
    notificationId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    channel: {
        type: String,
        enum: ["in-app", "email"],
        required: true
    },
    status: {
        type: String,
        enum: ["success", "failed"],
        required: true
    },
    error: {
        type: String,
        required: false
    },
    deliveredAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

export const NotificationPreference = mongoose.model("NotificationPreference", notificationPreferenceSchema);
export const NotificationTemplate = mongoose.model("NotificationTemplate", notificationTemplateSchema);
export const NotificationDeliveryLog = mongoose.model("NotificationDeliveryLog", notificationDeliveryLogSchema);
