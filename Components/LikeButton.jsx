import React, { useState, useEffect } from 'react';
import { getUserData } from '../src/utils/userData';
import { getDocumentData } from '../src/pages/Firebase/CloudFirestore/GetData';
import { updateDocument } from '../src/pages/Firebase/CloudFirestore/SetData';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart } from "react-icons/fa";

const LikeButton = ({ productId, className = "", size = 20 }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkIfLiked = async () => {
      const userData = getUserData();
      if (userData && userData.uid) {
        try {
          const userDoc = await getDocumentData('users', userData.uid);
          if (userDoc && userDoc.likedProducts) {
            setIsLiked(userDoc.likedProducts.includes(productId));
          }
        } catch (error) {
          console.error('Error checking like status:', error);
        }
      }
    };

    checkIfLiked();
  }, [productId]);

  const handleLike = async () => {
    const userData = getUserData();
    if (!userData || !userData.uid) {
      toast.error('Please log in to like products');
      return;
    }

    if (loading) return;

    setLoading(true);
    const newLikedStatus = !isLiked;
    setIsLiked(newLikedStatus);

    try {
      const userDoc = await getDocumentData('users', userData.uid);
      const currentLikedProducts = userDoc?.likedProducts || [];

      let updatedLikedProducts;
      if (newLikedStatus) {
        updatedLikedProducts = [...currentLikedProducts, productId];
      } else {
        updatedLikedProducts = currentLikedProducts.filter(id => id !== productId);
      }

      await updateDocument('users', userData.uid, {
        likedProducts: updatedLikedProducts
      });

      if (newLikedStatus) {
        toast.success('Product added to wishlist!');
      } else {
        toast.info('Product removed from wishlist');
      }
    } catch (error) {
      console.error('Error updating liked products:', error);
      toast.error('Failed to update likes');
      setIsLiked(!newLikedStatus); // Revert on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`btn ${className}`}
      style={{ border: 'none', background: 'transparent', padding: '0' }}
    >
      {isLiked ? (
        <FaHeart className="text-danger" size={size} />
      ) : (
        <FaRegHeart className="text-secondary" size={size} />
      )}
    </button>
  );
};

export default LikeButton;
