'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import UploadArrow from '../../../assets/icons/uploadarrow.png';
import './ReviewModal.css';
import { FaStar, FaArrowLeft } from 'react-icons/fa';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string; // ✅ required for rating submission
    title: string;
    image: string;
  };
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, product }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('User not authenticated');
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/rating/rate`,
        {
          productId: product.id,
          score: rating,
          comment: reviewText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ Rating submitted:', response.data);
      onClose(); // Close modal after success
    } catch (error: any) {
      console.error('❌ Failed to submit rating:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modalheader">
          <FaArrowLeft />
          <h2>Review</h2>
          <button className="bordered-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="productinfo">
          <Image src={product.image} alt={product.title} width={80} height={80} />
          <h3>{product.title}</h3>
        </div>

        <form onSubmit={handleSubmit} className="ratingform">
          <div className="headingstar">
            <h2>Give Us a Rating</h2>
          </div>

          <div className="rating-stars">
            {Array.from({ length: 5 }).map((_, i) => {
              const isFilled = i < (hovered || rating);
              return (
                <span
                  key={i}
                  className="star-icon"
                  style={{
                    fontSize: '24px',
                    color: isFilled ? '#FFD700' : '#b2b2b2',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={() => setHovered(i + 1)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(i + 1)}
                >
                  <FaStar />
                </span>
              );
            })}
          </div>

          <div className="reviewtextarea">
            <h2>Write a Review</h2>
            <textarea
              placeholder="Please Share Your Review About The Product"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="review-textarea"
            />
          </div>

          <label className="upload-box">
            <Image src={UploadArrow} alt="upload" width={24} height={24} />
            <p>Click here to add product photos or videos</p>
            <input type="file" hidden onChange={handleFileChange} />
            {file && <p className="file-name">{file.name}</p>}
          </label>

          <button type="submit" className="reviewsubmit background-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
