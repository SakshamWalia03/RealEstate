import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import app from "../firebase";
import axios from "axios";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateListing from "./CreateListing";
import ProfileUpdate from "./ProfileComponents/ProfileUpdate";
import YourListings from "./ProfileComponents/YourListings";

const images = [
  "https://images.unsplash.com/photo-1565402170291-8491f14678db?q=80&w=2917&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [showFavoriteError, setShowFavoriteError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [favoriteList, setFavoriteList] = useState([]);
  const dispatch = useDispatch();
  const [currentImage, setCurrentImage] = useState(0);
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type = "info") => {
    toast[type](message, {
      position: "top-center",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Handle Image Upload
  const handleFileUpload = useCallback((file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setFilePerc(
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        );
      },
      () => setFileUploadError(true),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData((prev) => ({ ...prev, avatar: downloadURL }));
      }
    );
  }, []);

  useEffect(() => {
    if (file) handleFileUpload(file);
  }, [file, handleFileUpload]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirm = window.confirm("Are you sure you want to update account?");
    if (confirm) {
      try {
        dispatch(updateUserStart());
        const response = await fetch(`/api/user/update/${currentUser._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.success === false) {
          dispatch(updateUserFailure(data.message));
          showToast(data.message, "error");
          return;
        }

        dispatch(updateUserSuccess(data));
        setUpdateSuccess(true);
        showToast("User is updated successfully!", "success");
      } catch (error) {
        dispatch(updateUserFailure(error.message));
        showToast(error.message, "error");
      }
    } else {
      return;
    }
  };

  const handleGetFavoriteList = async () => {
    if (!currentUser?._id) {
      console.error("User not logged in or invalid user ID");
      showToast("You need to log in first!", "error");
      return;
    }
  
    try {
      const response = await axios.get(`/api/favorite/${currentUser._id}`);
      
      if (!response.data || !Array.isArray(response.data.favoriteProperties)) {
        throw new Error("Invalid response format from server");
      }
  
      console.log("Favorites List:", response.data.favoriteProperties);
  
      if (response.data.favoriteProperties.length !== response.data.prevFavCount) {
        showToast("Some properties were deleted by the sellers", "info");
      }
  
      setFavoriteList(response.data.favoriteProperties);
    } catch (error) {
      console.error("Error fetching favorite list:", error.response?.data?.message || error.message);
      setShowFavoriteError(true);
      showToast(error.response?.data?.message || "Error showing favorites", "error");
    }
  };

  const handleRemoveFromFavorite = async (listingId) => {
    const confirm = window.confirm(
      "Are you sure you want to remove this property from favorites??"
    );
    if (confirm) {
      try {
        const response = await axios.delete(`/api/favorite/${listingId}`, {
          user: currentUser,
        });
        console.log(response.data.message);

        if (response.status === 200) {
          showToast(response.data.message, "success");
        }

        setFavoriteList((prev) =>
          prev.filter((listing) => listing._id !== listingId)
        );
      } catch (error) {
        console.error("Error updating favorite status:", error);
      }
    } else {
      return;
    }
  };

  const handleDeleteUser = async () => {
    const confirm = window.confirm("Are you sure you want to delete account?");
    if (confirm) {
      try {
        dispatch(deleteUserStart());
        const response = await fetch(`/api/user/delete/${currentUser._id}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success === false) {
          dispatch(deleteUserFailure(data.message));
          showToast(data.message, "error");
          return;
        }
        showToast("User deleted successfully!", "success");
        dispatch(deleteUserSuccess(data));
      } catch (error) {
        showToast(error.message, "error");
        dispatch(deleteUserFailure(error.message));
      }
    } else {
      return;
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const data = await axios.get("/api/auth/signout", { user: currentUser });

      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        showToast(data.message, "error");
        return;
      }
      showToast("Signed out successfully!", "success");
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      showToast(error.message, "error");
      dispatch(deleteUserFailure(error.message));
    }
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // const handleShowListings = async () => {
  //   try {
  //     setShowListingsError(false);

  //     const response = await fetch(`/api/user/listing/${currentUser._id}`);
  //     const data = await response.json();
  //     console.log(data);

     
  //       if (data.success === false) {
  //         setShowListingsError(true);
  //         showToast("Error showing listings", "error");
  //         return;
  //       }

  //     setUserListings(data);
  //   } catch (error) {
  //     setShowListingsError(true);
  //     showToast("Error showing listings", "error");
  //   }
  // };

  // const handleListingDelete = async (listingId) => {
  //   const confirm = window.confirm("Are you sure you want to delete account?");
  //   if (confirm) {
  //     try {
  //       const response = await fetch(`/api/listing/delete/${listingId}`, {
  //         method: "DELETE",
  //       });

  //       const data = await response.json();

  //       if (data.success === false) {
  //         console.log(data.message);
  //         showToast(data.message, "error");
  //         return;
  //       }

  //       setUserListings((prev) =>
  //         prev.filter((listing) => listing._id !== listingId)
  //       );
  //     } catch (error) {
  //       console.log(error.message);
  //       showToast(error.message, "error");
  //     }
  //   } else {
  //     return;
  //   }
  // };

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div
        className={`w-full md:w-1/5 bg-gray-800 justify-between  p-4 h-[40vh] md:h-[95vh] text-white ${
          isSidebarOpen ? "block" : "hidden"
        } md:block`}
      >
        <div className="mb-7 flex flex-col gap-4">
          <button
            onClick={() => setActiveSection("profile")}
            className={`w-full p-2 rounded ${
              activeSection === "profile"
                ? "bg-green-700 font-bold"
                : "hover:bg-green-600"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveSection("updateProfile")}
            className={`w-full p-2 rounded ${
              activeSection === "updateProfile"
                ? "bg-blue-700 font-bold"
                : "hover:bg-blue-400"
            }`}
          >
            Update Profile
          </button>
          <button
            onClick={() => setActiveSection("createListing")}
            className={`w-full p-2 rounded ${
              activeSection === "createListing"
                ? "bg-green-600 font-bold"
                : "hover:bg-green-500"
            }`}
          >
            Create Listing
          </button>
          <button
            onClick={() => {
              setActiveSection("listings");
              // handleShowListings();
            }}
            className={`w-full p-2 rounded ${
              activeSection === "listings"
                ? "bg-yellow-700 font-bold"
                : "hover:bg-yellow-600"
            }`}
          >
            Show Listings
          </button>
          <button
            onClick={() => {
              setActiveSection("favorite");
              handleGetFavoriteList();
            }}
            className={`w-full p-2 rounded ${
              activeSection === "favorite"
                ? "bg-yellow-700 font-bold"
                : "hover:bg-yellow-600"
            }`}
          >
            Show Favorites
          </button>
        </div>
        <div className="">
          <button
            onClick={handleDeleteUser}
            className="w-full p-2 bg-red-500 rounded hover:bg-red-400"
          >
            Delete Account
          </button>
          <button
            onClick={handleSignOut}
            className="w-full p-2 bg-red-500 rounded mt-2 hover:bg-red-400"
          >
            Sign Out
          </button>
        </div>
      </div>
      <button
        className="md:hidden absolute top-15 left-4 z-10 p-2 bg-gray-800 text-white"
        onClick={handleToggleSidebar}
      >
        ☰
      </button>

      {/* Main Content */}
      <div
        className="flex-1 px-4 mx-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${images[currentImage]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 1s  ease-in",
          position: "relative",
        }}
      >
        <div className="p-9 max-w-6xl pt-5">
          {activeSection === "profile" && (
            <div className="p-9 max-w-xl mx-auto pt-20">
              <div className="flex flex-col gap-4">
                <img
                  src={formData.avatar || currentUser.avatar}
                  alt="profile"
                  className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
                />
                <p className="border p-3 rounded-lg text-white text-center">
                  {currentUser.username}
                </p>
                <p className="border p-3 rounded-lg text-white text-center">
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}
          {activeSection === "updateProfile" && <ProfileUpdate />}
          {activeSection === "createListing" && (
            <CreateListing setActiveSection={setActiveSection} />
          )}
          {activeSection === "listings" && (
            <YourListings setActiveSection={setActiveSection} />
          )}
          ;
          {activeSection === "favorite" && (
            <div style={{ maxHeight: "87vh", overflowY: "auto" }}>
              {favoriteList && favoriteList.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <h1
                    className="text-yellow-200 p-5 text-center mt-7 text-3xl font-semibold"
                    style={{ fontFamily: "Permanent Marker" }}
                  >
                    Your Favorites
                  </h1>

                  {favoriteList.map((listing) => (
                    <div
                      key={listing._id}
                      className="border rounded-lg p-3 flex justify-between items-center gap-5"
                      style={{ backdropFilter: "blur(10px)" }}
                    >
                      <Link to={`/listing/${listing._id}`}>
                        <img
                          src={listing.imageUrls?.[0] || "/placeholder.jpg"} // Handle missing image
                          alt="listing cover"
                          className="h-16 w-16 object-contain"
                        />
                      </Link>
                      <Link
                        className="text-slate-200 font-semibold hover:underline truncate flex-1"
                        to={`/listing/${listing._id}`}
                      >
                        <p>{listing.name || "Unnamed Listing"}</p>
                      </Link>

                      <button
                        onClick={() => handleRemoveFromFavorite(listing._id)}
                        className="px-5 py-3 text-base font-semibold text-white bg-red-700 rounded-md hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center gap-5 pt-10">
                  <h2 className="text-white text-2xl font-semibold">
                    No favorite listings yet.
                  </h2>
                  <p className="text-gray-400 mb-4">
                    Browse listings and add some to your favorites!
                  </p>
                  <Link to="/search">
                    <button className="bg-green-600 text-white px-5 py-3 rounded-md font-semibold hover:bg-green-700">
                      Explore Listings
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
