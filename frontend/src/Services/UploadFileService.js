import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";

class UploadFileService {
  // Async method to upload file to Firebase Storage
  async uploadFile(file, path) {
    try {
      // Creating a reference to the storage location
      const fileRef = ref(storage, `${path}/${file.name}`);
      // Uploading the file
      const uploadTask = uploadBytesResumable(fileRef, file);

      // Handling the upload progress, errors, and success status
      return await uploadTask
        .then(async (snapshot) => {
          // Getting the download URL after successful upload
          const url = await getDownloadURL(snapshot.ref);
          return url;
        })
        .catch((err) => {
          // Throwing an error if upload fails
          throw new Error(`${err}`);
        });
    } catch (error) {
      // Throwing an error if the entire try block fails
      throw new Error(`${error}`);
    }
  }
}

export default UploadFileService;