import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app  from "../../firebase"; // Ensure Firebase is properly initialized
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
} from "../../redux/user/userSlice";

const ProfileUpdate = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: currentUser.username,
    email: currentUser.email,
    password: "",
    avatar: currentUser.avatar,
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [filePerc, setFilePerc] = useState(0);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  // Handle Image Selection (Preview & Upload)
  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFormData((prev) => ({
        ...prev,
        avatar: URL.createObjectURL(selectedFile), // Temporary preview
      }));
    }
  };

  // Upload Image to Firebase
  const uploadImage = async () => {
    if (!file) return formData.avatar; // If no new image, keep existing avatar

    return new Promise((resolve, reject) => {
      setUploading(true);
      const storage = getStorage(app);
      const fileName = `${new Date().getTime()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFilePerc(progress);
        },
        (error) => {
          setFileUploadError("Image upload failed (Max 2MB per image)");
          setUploading(false);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          resolve(downloadURL);
        }
      );
    });
  };

  // Handle Profile Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmUpdate = window.confirm("Are you sure you want to update your profile?");
    if (!confirmUpdate) return;

    setLoading(true);
    dispatch(updateUserStart());

    try {
      const avatarUrl = await uploadImage(); // Upload image if changed
      const updatedData = { ...formData, avatar: avatarUrl };

      const response = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.message);
      }

      dispatch(updateUserSuccess(data));
      alert("User updated successfully!");
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-9 max-w-xl mx-auto pt-20">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="file" ref={fileRef} hidden accept="image/*" onChange={handleImageChange} />
        
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />

        <p className="text-sm self-center">
          {fileUploadError ? (
            <span className="text-red-700">{fileUploadError}</span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Image successfully uploaded!</span>
          ) : null}
        </p>

        <input
          type="text"
          id="username"
          value={formData.username}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />
        <input
          type="password"
          id="password"
          placeholder="New Password (optional)"
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />
        
        <button
          disabled={loading || uploading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </form>
    </div>
  );
};

export default ProfileUpdate;