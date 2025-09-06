import React, { useState, useRef, useEffect } from 'react';
import './exchange.css';
import { Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExchangeProps {
  onClose: () => void;
  orderId: string;   // ✅ Pass orderId from parent
  buyerId: string;
    onRequestSuccess?: (orderId: string, status: string) => void; // new
     // ✅ Pass buyerId from parent (from JWT or user context)
}

function Exchange({ onClose, orderId, buyerId, onRequestSuccess }: ExchangeProps) {
  const [reason, setReason] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Trigger hidden file input
  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    setUploadedFiles((prev) => [...prev, ...fileArray]);
  };

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast.error('Please select a reason for exchange');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to submit a request');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('buyerId', buyerId);
      formData.append('reason', reason);

      uploadedFiles.forEach((file) => {
        formData.append('images', file); // matches backend multer field name
      });

      const res = await fetch(
        'https://order-service-faxh.onrender.com/api/orders/return-request',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to submit return request');
      }

      const data = await res.json();
      console.log('✅ Return request created:', data);
      toast.success('Return request submitted successfully');
      if (onRequestSuccess) {
  onRequestSuccess(orderId, data.status || 'Pending'); // assuming backend returns status
}
      onClose();
    } catch (err: any) {
      console.error('❌ Error submitting return request:', err);
      toast.error(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="exchange-overlay">
      <div className="returnform" ref={modalRef}>
        <div className="returnheading">
          <h2>Reason For Exchange</h2>
          <button className="bordered-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reason">Select Reason</label>
           <select
  id="reason"
  value={reason}
  onChange={(e) => setReason(e.target.value)}
  className="dropdown"
>
  <option value="">Reason For Exchange</option>
  <option value="defective">Damaged Product</option>
  <option value="wrong_item">Received Wrong Item</option>
  <option value="size_mismatch">Wrong Size</option>
  <option value="other">Other</option>
</select>

          </div>

          <div className="imageupload">
            {uploadedFiles.length === 0 && (
              <div className="container1" onClick={handleBoxClick}>
                <ImageIcon />
                <p>Click to upload</p>
                <span>or drag and drop</span>
              </div>
            )}

            {uploadedFiles.map((file, index) => {
              const fileURL = URL.createObjectURL(file);

              return (
                <div key={index} className="container1">
                  {file.type.startsWith('image/') && (
                    <div className="file-preview">
                      <img src={fileURL} alt={`preview-${index}`} />
                    </div>
                  )}
                  {file.type.startsWith('video/') && (
                    <div className="file-preview">
                      <video src={fileURL} controls />
                    </div>
                  )}
                </div>
              );
            })}

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
            />
          </div>

          <button type="submit" className="background-buttonver">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Exchange;
