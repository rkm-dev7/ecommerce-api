const fs = require("fs").promises; // Import fs.promises for promise-based file system operations
const deleteImage = async (userImagePath) => {
  try {
    await fs.access(userImagePath);
    await fs.unlink(userImagePath);
    console.log("User Image has been successfully deleted");
  } catch (error) {
    console.error("User Image does not exist.");
  }
};
module.exports = deleteImage;
