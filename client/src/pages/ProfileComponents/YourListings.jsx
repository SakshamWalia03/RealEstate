import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const YourListings = ({ setActiveSection }) => {
  const [userListings, setUserListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

  // Fetch user listings when the component mounts
  useEffect(() => {
    let isMounted = true; // Prevent memory leaks
    setLoading(true);

    const fetchListings = async () => {
      try {
        if (!currentUser) return;

        const response = await fetch(`/api/user/listings/${currentUser._id}`);
        const data = await response.json();
        console.log(data);

        if (isMounted) {
          setUserListings(data); // Fix: Use extracted `data`
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to fetch listings.");
          setLoading(false);
        }
      }
    };

    fetchListings();

    return () => {
      isMounted = false; // Cleanup function to prevent state updates after unmount
    };
  }, [currentUser]); // Fix: Added `currentUser` to dependencies

  // Handle listing deletion
  const handleListingDelete = async (listingId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this listing?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/listing/delete/${listingId}`);

      // Update state by filtering out the deleted listing
      setUserListings((prevListings) =>
        prevListings.filter((listing) => listing._id !== listingId)
      );

      alert("Listing deleted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete listing.");
    }
  };

  if (loading)
    return <p className="text-center text-white">Loading listings...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div style={{ maxHeight: "87vh", overflowY: "auto" }}>
      {userListings.length > 0 ? ( // Fix: Use `length` instead of `length()`
        <div className="flex flex-col gap-4">
          <h1
            className="text-yellow-200 p-5 text-center mt-7 text-3xl font-semibold"
            style={{ fontFamily: "Permanent Marker" }}
          >
            Your Listings
          </h1>

          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-5"
              style={{
                backdropFilter: "blur(10px)",
              }}
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                  className="h-16 w-16 object-contain"
                />
              </Link>
              <Link
                className="text-slate-200 font-semibold hover:underline truncate flex-1"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="inline-flex items-center w-full px-5 py-3 mb-3 mr-1 text-base font-semibold text-white no-underline align-middle bg-red-700 border border-transparent border-solid rounded-md cursor-pointer select-none sm:mb-0 sm:w-auto hover:bg-red-600 hover:border-red-600 hover:text-white focus-within:bg-red-600 focus-within:border-red-600"
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="inline-flex items-center w-full px-5 py-3 mb-3 mr-1 text-base font-semibold text-white no-underline align-middle bg-blue-600 border border-transparent border-solid rounded-md cursor-pointer select-none sm:mb-0 sm:w-auto hover:bg-blue-700 hover:border-blue-700 hover:text-white focus-within:bg-blue-700 focus-within:border-blue-700">
                    Edit
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Fallback message when there are no listings
        <div className="flex flex-col gap-5 items-center justify-center text-center mt-10">
          <h2 className="text-white text-2xl font-semibold">
            No listings yet.
          </h2>
          <p className="text-gray-400 mb-4">
            Add a new listing to get started!
          </p>
          <button
            onClick={() => setActiveSection("createListing")}
            className="bg-green-600 text-white px-5 py-3 rounded-md font-semibold hover:bg-green-700"
          >
            Add a New Listing
          </button>
        </div>
      )}
    </div>
  );
};

export default YourListings;