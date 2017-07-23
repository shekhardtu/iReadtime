var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
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
        default: Date.now,
        required: true
    },
    isRegistered: {
        type: Boolean,
        required: true
    },
    environment: {
        type: String, // It can be used to identify data type as if production data or development data.
        required: true
    },
    clientIp: {
        type: String,
        required: true
    },
    skipPages: {
        type: Array
    }
});

// 
var urlInfoSchema = new Schema({
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

var visitedUrlSchema = new Schema({
    href: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    origin: {
        type: String,
    },
    protocol: {
        type: String,
        required: true,
        trim: true
    },
    host: {
        type: String,
        required: true,
        trim: true
    },
    hostname: {
        type: String,
        required: true,
        trim: true
    },
    port: {
        type: String
    },
    pathname: {
        type: String
    },
    search: {
        type: String
    },
    hash: {
        type: String
    },
    userId: {
        type: String,
        required: true,
        trim: true
    },
    referrer: {
        type: String
    },
    environment: {
        type: String
    },
    articleId: {
        type: String,
        required: true,
        trim: true
    },
    clientIp: {
        type: String,
        required: true
    },
    skipPage: {
        type: Boolean
    }
});

var readTimeSchema = new Schema({
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

mongoose.model('Readtime', readTimeSchema, 'readtimes');
mongoose.model('User', userSchema, 'users');
mongoose.model('VisitedUrl', visitedUrlSchema, 'visitedurls');

//mongoose.model(users, usersSchema, "users");