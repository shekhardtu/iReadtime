##This list is according to the priorities of the features and the products of clipsack##

users: 
{
    idCreatedTimeStamp: @timestamp,
    email: "shekhardtu@gmail.com", // it will contain only primary email id. @unique key
    accountType: "personal or business",
    clpsckId: "" unregistered,
    consumer_key: 
    access_token:
    
}


bookmarks: 
{
    "temp_id": "temporary id",
    "url": "url",
    "title": "title of added url",
    "user_id": "it will be a foreign key from users table",
    "excerpt": "it will contains short description from article",
    "sort_id": "numeric id to show the acticle position",
    "source": desktop, api, ext_header, ext_toolbar,",
}

// This document will contain the data for each user 

readtime: {
    "userId":"32bit key",
    "articleId":  "hashConvrsionOfURL",
    "url": "url of the article",
    "wordCount": "numeric" // if zero that content is not readable
    "imgCount": "", @number 
    "avgReadTime": "", average reading time of that article @number
    "isCompleted": "", @boolean
    "completedDate: "", @array of dates
    "visitRepeat": "" @array of dates
}

