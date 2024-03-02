const mongoose = require('mongoose');
const { Schema } = mongoose;


const UserSchema = new Schema({
    login_type: { type: String, index: true, default: 'auton8' },
    username: { type: String, index: true },
    full_name: { type: String, index: true },
    email: { type: String, index: true },
    password: { type: String, index: true, select: false },
    status: { type: Boolean, default: true },
    email_verified: { type: Boolean, default: false },
    is_referral: { type: Boolean, index: true, default: false },
    profile_pic: { type: String, index: true, default: null },
    referred_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        index: true,
        ref: 'User'
    },
    organization: [{
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        ref: 'Organization',
        default: null
    }],
    shared_organization: [{
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        ref: 'Organization',
        default: null
    }],
    type: { type: String, index: true },
    invite: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        ref: 'Invite',
        default: null
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    collection: 'users',
    strict: false,
    strictQuery: false,
});

UserSchema.set('autoIndex', true)
const User = mongoose.model('User', UserSchema);
module.exports = User;