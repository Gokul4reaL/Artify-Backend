const fs = require("fs");
import axios from "axios";
import { resolve } from "path";
import sharp from "sharp";
const FormData = require('form-data'); // Make sure to install FormData if using in Node.js
const { google } = require("googleapis");
const keys = require("../../keys.json"); // Path to your keys.json file

class SingleStyleRepository {
  drive: any;

  constructor() {
    this.drive = google.drive({ version: "v3" });
    this.ensureTempDirectoryExists(); // Call function to ensure temp directory exists
  }

  // Function to create the temp directory if it doesn't exist
  ensureTempDirectoryExists() {
    const tempDir = "./uploads";
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
  }

  async uploadImage(payload: any) {
    try {
      if (!payload || !payload.image || !payload.userID) {
        throw new Error("Missing image or userID");
      }

      const { name, content } = payload.image;

      // Decode base64-encoded image data
      const imageData = Buffer.from(
        content.split(";base64,").pop() || "",
        "base64"
      );

      // Save the image to a temporary file
      const tempFilePath = `./uploads/${name}`;
      fs.writeFileSync(tempFilePath, imageData);
      const folderID = "15Fq28FPAxHSe6O76yohUkDZ-MzzCgFP2";

      // Upload the temporary file to Google Drive
      const fileId = await this.uploadToGoogleDrive(
        tempFilePath,
        folderID,
        payload
      );

      // Delete the temporary file
      fs.unlinkSync(tempFilePath);

      return fileId;
    } catch (error) {
      console.error("Error uploading image to Google Drive:", error);
      throw error;
    }
  }

  async uploadToGoogleDrive(filePath: any, folderID: any, payload: any) {
    const userId = payload.userID.slice(-6); // Extract last 6 numbers of userID
    const imageName = payload.image.name; // Get the original image name without extension
    const imageExtensionIndex = imageName.lastIndexOf("."); // Find the last occurrence of '.'
    const imageNameWithoutExtension =
      imageExtensionIndex !== -1
        ? imageName.substring(0, imageExtensionIndex)
        : imageName; // Remove extension if found
    const currentMinute = new Date().getTime(); // Get the current minute
    const uploadedImageName = `${imageNameWithoutExtension}_${userId}_${currentMinute}`; // Combine userID, image name without extension, and current minute

    // Authenticate with Google Drive
    const auth = new google.auth.GoogleAuth({
      credentials: keys,
      scopes: ["https://www.googleapis.com/auth/drive"], // Scopes for accessing Google Drive
    });
    const drive = google.drive({ version: "v3", auth });

    // Upload the file to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: uploadedImageName,
        parents: [folderID],
      },
      media: {
        mimeType: "image/jpeg",
        body: fs.createReadStream(filePath),
      },
    });

    return response.data.id;
  }

  async getImages() {
    try {
      const folderId = "1niHmdjSA6dPWrFvCG7-rf9QGb07ENOQw"; // Replace 'YOUR_FOLDER_ID_HERE' with the ID of your folder in Google Drive
      const images = await this.getImagesFromFolder(folderId);
      return images; // Corrected: JSON.stringify instead of JSON(images)
    } catch (error) {
      console.error("Error fetching images:", error);
      throw new Error("Internal server error"); // Corrected: using throw instead of res.status
    }
  }

  async getImagesFromFolder(folderId: any) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: keys,
        scopes: ["https://www.googleapis.com/auth/drive.readonly"], // Scope for read-only access to Google Drive
      });

      const drive = google.drive({ version: "v3", auth });

      // List files in the folder
      const res = await drive.files.list({
        q: `'${folderId}' in parents`, // Query for files in the specified folder
        fields: "files(id, name, webViewLink)", // Specify fields to retrieve
      });

      const images = await Promise.all(
        res.data.files.map(
          async (file: { id: any; name: any; webViewLink: any }) => {
            // Extract file ID from webViewLink
            const fileId = file.webViewLink.match(/\/file\/d\/([^/]+)/);
            if (fileId && fileId.length > 1) {
              const id = fileId[1];
              // Construct the direct URL without the /view?usp=drivesdk part
              const downloadUrl = `https://drive.google.com/uc?id=${id}`;
              const response = await axios.get(downloadUrl, {
                responseType: "arraybuffer", // Set response type to array buffer to receive binary data
              });
              if (response.status === 200) {
                const base64Image = Buffer.from(
                  response.data,
                  "binary"
                ).toString("base64"); // Convert binary data to base64
                return {
                  id: file.id,
                  name: file.name,
                  url: `data:image/jpeg;base64,${base64Image}`, // Create base64-encoded data URL
                };
              } else {
                console.error("Error downloading image:", response.statusText);
                return null;
              }
            } else {
              // If file ID cannot be extracted, return null or handle the case as needed
              return null;
            }
          }
        )
      );

      // Filter out null values if any
      const filteredImages = images.filter((image: any) => image !== null);

      return filteredImages;
    } catch (error) {
      console.error("Error fetching images from Google Drive:", error);
      throw error;
    }
  }

  // Function to generate image from Google Drive and run in Colab GPU mode
  async resizeToSmallerImage(base64Image1: any, base64Image2: any) {
    try {
        // Get metadata of both images
        const metadata1 = await sharp(Buffer.from(base64Image1, "base64")).metadata();
        const metadata2 = await sharp(Buffer.from(base64Image2.split(";base64,").pop() || "", "base64")).metadata();
        

        let resizedImage1, resizedImage2;

        if (metadata1.width * metadata1.height > metadata2.width * metadata2.height) {
            // Resize image 1 to match the dimensions of image 2
            resizedImage1 = await this.resizeImage1(base64Image1, metadata2.width, metadata2.height);
            resizedImage2 = base64Image2;
        } else {
            // Resize image 2 to match the dimensions of image 1
            resizedImage1 = base64Image1;
            resizedImage2 = await this.resizeImage2(base64Image2, metadata1.width, metadata1.height);
        }

        return [resizedImage1, resizedImage2];
    } catch (error) {
        console.error("Error resizing images:", error);
        throw error; // Re-throw the error to propagate it to the caller
    }
}

async resizeImage1(base64Image: any, targetWidth: any, targetHeight: any) {
    try {
      const resizedBuffer = await sharp(Buffer.from(base64Image, "base64"))
            .resize(targetWidth, targetHeight)
            .toBuffer();
        return resizedBuffer.toString("base64");
    } catch (error) {
        console.error("Error resizing image:", error);
        throw error; // Re-throw the error to propagate it to the caller
    }
}

async resizeImage2(base64Image: any, targetWidth: any, targetHeight: any) {
  try {
      const resizedBuffer = await sharp(Buffer.from(base64Image.split(";base64,").pop() || "", "base64"))
          .resize(targetWidth, targetHeight)
          .toBuffer();
      return resizedBuffer.toString("base64");
  } catch (error) {
      console.error("Error resizing image:", error);
      throw error; // Re-throw the error to propagate it to the caller
  }
}

async generateImage(payload: any) {
    try {
        const downloadUrl = `https://drive.google.com/uc?id=${payload.uploadedID}`;
        const response = await axios.get(downloadUrl, {
            responseType: "arraybuffer", // Set response type to array buffer to receive binary data
        });

        if (response.status === 200) {
            const base64ContentImage = Buffer.from(response.data, "binary").toString("base64");
            const base64StyleImage = payload.selectedImage.url;

            // Resize images to ensure they have the same dimensions
            const [resizedBase64ContentImage, resizedBase64StyleImage] = await this.resizeToSmallerImage(base64ContentImage, base64StyleImage);

            const formData = new FormData();
            formData.append("content", resizedBase64ContentImage);
            formData.append("style", resizedBase64StyleImage);

            const uploadResponse = await axios.post("http://127.0.0.1:5000/rsupload", formData);

            if (uploadResponse.status === 200) {
                return uploadResponse.data; // Return the response data string
            } else {
                console.error("Error uploading images:", uploadResponse.statusText);
                return null; // Return null if there is an error uploading images
            }
        } else {
            console.error("Error downloading images");
            return null; // Return null if there is an error downloading images
        }
    } catch (error) {
        console.error("Error generating images and running notebook:", error);
        return null; // Return null in case of any error
    }
}


  
}

export const singleStyleRepository = new SingleStyleRepository();
