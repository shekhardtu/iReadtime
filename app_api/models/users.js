var mongoose = require('mongoose');
var schema = mongoose.Schema;
var userSchema = new schema({
    accessToken: {
        type: String,
        required: true,
        trim: true
    },
    accountType: {
        type: String,
        required: true,
        trim: true
    },
    referrer: {
        type: String,
        required: true,
        trim: true
    },
    firstVisit: {
        type: Date,
        required: true
    },
    isRegistered: {
        type: Boolean,
        required: true
    },
    env: {
        type: String, // It can be used to identify data type as if production data or development data.
        required: true
    }
});


mongoose.model('User', userSchema, "users")
//mongoose.model(users, usersSchema, "users");