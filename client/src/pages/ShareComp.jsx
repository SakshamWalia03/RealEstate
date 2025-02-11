import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaShare, FaHeart } from "react-icons/fa";
import {
  EmailShareButton,
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

const ShareButtons = () => {
  const { listingId } = useParams();
  const [showShareButtons, setShowShareButtons] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  const shareUrl = window.location.href;
  const title = document.title;
  const { currentUser } = useSelector((state) => state.user);

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

  // ✅ Check if listing is already in favorites
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!listingId || !currentUser) return;

      try {
        const response = await axios.get(`/api/favorite/specific/${listingId}`, { user: currentUser });

        setIsFavorite(response.data.isFavorite);
      } catch (error) {
        console.error("Error fetching favorite status:", error);
        showToast("Failed to fetch favorite status", "error");
      }
    };

    fetchFavoriteStatus();
  }, [listingId, currentUser]);

  // ✅ Handle adding/removing from favorites
  const handleFavoriteClick = async () => {
    if (!currentUser) {
      showToast("Please log in to save favorites", "warning");
      return;
    }

    setLoadingFavorite(true);

    try {
      if (isFavorite) {
        // Remove from favorites
        await axios.delete(`/api/favorite/${listingId}`, 
          { user: currentUser },
        );
        setIsFavorite(false);
        showToast("Removed from favorites", "success");
      } else {
        // Add to favorites
        await axios.post(`/api/favorite/${listingId}`,{user: currentUser });
        setIsFavorite(true);
        showToast("Added to favorites", "success");
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
      showToast("Failed to update favorites", "error");
    } finally {
      setLoadingFavorite(false);
    }
  };

  return (
    <div className="flex fixed top-[18%] right-[3%] z-10 rounded-2xl">
      {/* Share Button */}
      <div className="relative">
        <button
          onClick={() => setShowShareButtons(!showShareButtons)}
          className="bg-slate-100 px-3 py-3 text-2xl font-bold text-white rounded-2xl"
        >
          <FaShare className="text-slate-500 cursor-pointer" />
        </button>

        {showShareButtons && (
          <div className="flex p-3 gap-4 rounded-xl bg-slate-300 mt-2 right-0">
            <FacebookShareButton url={shareUrl} quote={title}>
              <img
                alt="Facebook"
                src="https://cdn-icons-png.flaticon.com/256/124/124010.png"
                width={30}
              />
            </FacebookShareButton>
            <TwitterShareButton url={shareUrl} title={title}>
              <img
                alt="Twitter"
                src="https://img.freepik.com/free-vector/new-2023-twitter-logo-x-icon-design_1017-45418.jpg?size=338&ext=jpg"
                width={30}
              />
            </TwitterShareButton>
            <EmailShareButton url={shareUrl} subject={title}>
              <img
                alt="Email"
                src="https://ongpng.com/wp-content/uploads/2023/09/gmail-logo-2.png"
                width={30}
              />
            </EmailShareButton>
            <WhatsappShareButton url={shareUrl} title={title}>
              <img
                alt="WhatsApp"
                src="https://static.vecteezy.com/system/resources/previews/019/490/741/non_2x/whatsapp-logo-whatsapp-icon-logo-free-free-vector.jpg"
                width={30}
              />
            </WhatsappShareButton>
          </div>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className="ml-3 bg-red-500 px-3 py-3 text-2xl font-bold text-white rounded-2xl"
        disabled={loadingFavorite}
      >
        <FaHeart className={isFavorite ? "text-white" : "text-gray-300"} />
      </button>
    </div>
  );
};

export default ShareButtons;