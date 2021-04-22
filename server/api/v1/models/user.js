import Mongoose, { Schema } from 'mongoose';


const options = {
    toJSON: {
        transform: (doc, obj) => {
            delete obj.__v;
            delete obj.id;
            return obj;
        },
        virtuals: false,
    },
    timestamps: true,
    strict: false,
    collection: 'user',
};

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
    },
    name: {
        type: String,
        trim: true,
    },
    mobile: {
        type: String,
    },
    gender: {
        type: String,
    },
    profile_picture: {
        type: String,
    },
    role: {
        type: String,
        default: "user"
    },
    isMobileVerified: {
        type: Boolean,
        default: false
    },
    preferences: {
        type: Array
    },
    about_me: {
        type: String
    },
    currency: {
        type: String
    },
    currency_code: {
        type: String
    },
    country: {
        type: String
    },
    socialMediaId: {
        type: String
    },
    customAccountId: {
        type: String
    },
    customAccountStatus: {
        type: String,
        default: "NA"
    },
    otp: {
        type: String,
    },
    otpTime: {
        type: Number,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    customAccountId: {
        type: String
    },
    identity: {
        type: String,
    },
    selfie: {
        type: String,
    },
    rejected: {
        type: Boolean,
        default: true
    },
    paymentMethod: {
        type: String,
        default: "NA"
    },
    fcmToken: {
        deviceId: {
            type: String
        },
        regToken: {
            type: String
        }
    }
}, options);

const userModel = Mongoose.model('user', userSchema);

export default class user {
    constructor() {
        this.model = userModel;
    }
    static get modelName() {
        return userModel.modelName;
    }
}