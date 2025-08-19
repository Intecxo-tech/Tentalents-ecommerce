'use client';

import React, { useState, useRef, useEffect  } from 'react';
import Image from 'next/image';
import axios from 'axios';

import UploadArrow from '../../../assets/icons/uploadarrow.png';
import './ReviewModal.css';
import { FaStar, FaArrowLeft } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';  // Import toast and Toaster

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    image: string;
  };
}

const MAX_FILE_SIZE_MB = 10;

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, product }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('User is not logged in');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('productId', product.id);
      formData.append('score', rating.toString());
      formData.append('comment', reviewText);

      if (file) {
        formData.append('file', file);
      }

      const response = await axios.post(
        `https://rating-service-kd8p.onrender.com/api/rating/rate`,
        formData,
        {
         headers: {
  Authorization: `Bearer ${token}`,
}
        }
      );

      console.log('✅ Rating submitted:', response.data);

      // Reset form
      setRating(0);
      setHovered(0);
      setReviewText('');
      setFile(null);

      onClose();
    } catch (error: any) {
      console.error('❌ Failed to submit rating:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      toast.error('Only image or video files are allowed.');
      e.target.value = '';
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File size must be less than ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toaster must be rendered once, you can move it to a higher level if you want */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="modal-backdrop">
        <div className="modal"  ref={modalRef}>
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
                maxLength={1000}
              />
            </div>

            <label className="upload-box">
              <Image src={UploadArrow} alt="upload" width={24} height={24} />
              <p>Click here to add product photos or videos</p>
              <input
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={handleFileChange}
              />
              {file && <p className="file-name">{file.name}</p>}
            </label>

            <button type="submit" className="reviewsubmit background-button" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReviewModal;

