const bcrypt = require('bcrypt');
bcrypt.hash('supersecurepassword', 10).then(console.log);
