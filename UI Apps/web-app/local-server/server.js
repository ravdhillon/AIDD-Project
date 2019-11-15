let express = require('express') // Import module. Module is like a jar or library
let app = express(); // calls to middleware functions.

/**
 * Got Request. It's handled by the middleware functions.  
 */
app.use(function(req, res, next) {
    console.log(`${new Date()} - ${req.method} request for ${req.url}`);
    next();
});

app.use(express.static('../static'));

app.listen(81, function() {
    console.log("Static serving on 81");
});