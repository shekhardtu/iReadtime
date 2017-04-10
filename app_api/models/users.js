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

var urlInfoSchema = new schema({
    url: {
        type: String,
        required: true,
        trim: true
    },
    suggestedTag: {
        type: [String],
    },
    resolvedUrl: {
        type: String,
    },
    excerpt: {
        type: String
    },
    title: {
        type: String
    }, 
    html: {
        type: String
    },
    domainId: {
        type: Number
    },
    firstAdded: {
        type: [Date]
    }

});
var readTimeSchema = new schema({
    userId: {
        type: String,
        required: true,
        trim: true
    },
    articleId: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    wordCount: {
        type: Number, // 0 || > 0
        required: true
    },
    imgCount: {
        type: Number, // 0 || > 0 
        required: true
    },
    visitRepeat: {
        type: [Date],
        required: true
    },
    isCompleted: {
        type: Boolean,
        required: true
    },
    completedDate: {
        type: [Date], // It can be used to identify data type as if production data or development data.
        required: true
    }
});

mongoose.model('Readtime', readTimeSchema, "readtimes");
mongoose.model('User', userSchema, "users");

//mongoose.model(users, usersSchema, "users");