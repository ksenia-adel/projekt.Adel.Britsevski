const bcrypt = require('bcrypt');

const generateHash = async () => {
  const password = 'admin1'; // replace with your password
  const saltRounds = 10;

  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Generated bcrypt hash:', hash);
};

generateHash();
