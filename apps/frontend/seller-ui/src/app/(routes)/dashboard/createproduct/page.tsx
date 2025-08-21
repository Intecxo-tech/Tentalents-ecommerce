'use client';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import {jwtDecode} from 'jwt-decode';
import { ChevronLeft,PlusIcon } from 'lucide-react';
import './products.css'
import { useRouter } from 'next/navigation';
type Variant = {
  name: string;
  value: string;
};

type FormData = {
  title: string;
  description?: string;
  category: string;
  subCategory?: string;
  brand?: string;
includedComponents?: string[]; // store as array internally

  numberOfItems?: number;
  enclosureMaterial?: string;
  productCareInstructions?: string;
productFeatures?: string[];

  sku: string;
  price: number;            // ✅ add
  originalPrice?: number;   // ✅ add
  stock: number;
  unit: string;
  itemWeight: number;
  packageLength?: number;
  packageWidth?: number;
  packageHeight?: number;
  deliveryEta?: string;
  vendorId: string;

  dispatchTimeInDays?: number;
  shippingCost?: number;
  variants?: Variant[];
};


const CreateProductPage: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      variants: [{ name: '', value: '' }],
      includedComponents: [''],
      productFeatures: [''],
    },
  });
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      const vendorIdFromToken = decoded.vendorId || decoded.id;
      if (vendorIdFromToken) {
        reset(prevValues => ({
          ...prevValues,
          vendorId: vendorIdFromToken
        }));
      }
    } catch (err) {
      console.error('Failed to decode token', err);
    }
  }
}, [reset]);

  // State to hold selected files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showVariants, setShowVariants] = useState(false);

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

 const fileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]; // strip prefix
      resolve(base64);
    };
    reader.onerror = reject;
  });
};



const onSubmit = async (data: FormData) => {
  try {
    setUploading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to create a product.');
      return;
    }

    // Helper: convert comma-separated strings to array
    const toArray = (value: string | string[] | undefined) =>
      Array.isArray(value)
        ? value.map(s => s.trim()).filter(Boolean)
        : (value ?? '').split(',').map(s => s.trim()).filter(Boolean);

    // Convert selected files to Base64 (strip prefix)
    let imagesBase64: string[] = [];
    if (selectedFiles.length > 0) {
      imagesBase64 = await Promise.all(
        selectedFiles.map(file => fileToBase64(file))
      );
    }

    const payload = {
      ...data,
      includedComponents: toArray(data.includedComponents),
      productFeatures: toArray(data.productFeatures),
      variants: data.variants?.filter(v => v.name && v.value) || [],
      images: imagesBase64, // <-- send images to backend
    };

    console.log('Submitting Product Data:', payload);

    // Send POST request to create product
    const createRes = await axios.post(
      'https://product-service-23pc.onrender.com/api/products',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Check if product object exists in response
   const createdProductId = createRes.data?.data?.product?.id;
if (!createdProductId) {
  throw new Error('Product creation failed: no product ID returned.');
}
    toast.success('Product created successfully!');

    // Reset form & selected files
    reset();
    setSelectedFiles([]);

    return createdProductId; // Return product ID if needed
  } catch (err: any) {
    console.error('Error creating product:', err);
    toast.error(err?.response?.data?.message || err.message || 'Failed to create product');
  } finally {
    setUploading(false);
  }
};


// const uploadImages = async (productId: string) => {
//   const token = localStorage.getItem('token');
//   if (!token) {
//     toast.error('You must be logged in to upload images.');
//     return;
//   }

//   if (!productId) {
//     toast.error('Product ID is missing. Cannot upload images.');
//     return;
//   }

//   try {
//     setUploading(true);

//     for (const file of selectedFiles) {
//       const base64 = await fileToBase64(file); // convert to base64

//       await axios.post(
//         `http://localhost:3003/api/products/${productId}/image`,
//         { imageBase64: base64 }, // JSON body expected by backend
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//     }

//     toast.success('Images uploaded successfully!');
//     setSelectedFiles([]);
//   } catch (err: any) {
//     console.error(err);
//     toast.error(err?.response?.data?.message || 'Failed to upload images');
//   } finally {
//     setUploading(false);
//   }
// };



  return (
    <div >
     <div className="producst-main">
        
     <div className="product-headerleft">
      <button className='bordered-button'>
        <ChevronLeft />
      </button>
      <div className='title-sect'>
      <p>Products</p>
       <h2 className='product-input'>Add A New Product</h2>
       </div>

     </div>
     <div className="product-headerright">
    
       <button
  className='discard-b'
  type="button"
  onClick={() => {
    reset(); // reset form fields
    setSelectedFiles([]); // reset selected images
    router.push('/dashboard/store'); // or '/dashboard'
  }}
>
  Discard
</button>
       <button className='bordered-button'>Schedule</button>
       <button
  type="button"
  className='background-button'
  disabled={isSubmitting}
  onClick={handleSubmit(onSubmit)}
>
  Add Product <PlusIcon />
</button>
     </div>
     </div>
    
   

        {/* Title */}
           <form onSubmit={handleSubmit(onSubmit)}>
      <div className="main-coteinr">
 <div className="left-side">
  <div className='section-desc'>
          <div className="desc-heading">
            <h2>Description</h2>
          </div>
       
        <div className="desc-container">
 <div>
         
          <input {...register('title', { required: 'Title is required' })} placeholder='Product Name' />
          {errors.title && <p style={{color: 'red'}}>{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
         
          <textarea {...register('description')} placeholder='Description' />
        </div>
        </div>
        
</div>
 <div className='section-desc'>
   <div className="desc-heading">
            <h2>Category</h2>
          </div>
          <div className="desc-container">
<div >
  {/* <label>Category </label><br /> */}
  <select {...register('category', { required: 'Category is required' })} 
  defaultValue="" className='select-options'>
    <option value="" disabled>Select Category</option>
    <option value="Fashion">Fashion</option>
    <option value="Hardware">Hardware</option>
    <option value="Appliances">Appliances</option>
    <option value="Tools">Tools</option>
    <option value="Beauty">Beauty</option>
    <option value="Medical Equips">Medical Equips</option>
    <option value="Auto Parts">Auto Parts</option>
  </select>
  {errors.category && <p style={{ color: 'red' }}>{errors.category.message}</p>}
</div>
          <div>
        
          <input {...register('subCategory')} placeholder='SubCategory'  />
        </div>
 </div>
       </div>
          <div className='section-desc'>
          <div className="desc-heading">
            <h2>Description</h2>
          </div>
         <div className="desc-container">
          <div className="paer1">
<div>
       
          <input {...register('brand')} placeholder='Brand' />
        </div>

        {/* Included Components */}
         <div>
        
          <input type="number" {...register('numberOfItems', { valueAsNumber: true })} placeholder='Number of Items' />
        </div>
       
          </div>
               <div className="paer1">
  <div>
         
          <input {...register('includedComponents')} placeholder='Included Components (comma separated)'/>
        </div>

        {/* Enclosure Material */}
       
               </div>

 <div>
      
          <textarea {...register('enclosureMaterial')} placeholder='Enclosure Material' />
        </div>
        
        

        {/* Number of Items */}
      

        {/* Product Care Instructions */}
        <div>

          <textarea {...register('productCareInstructions')}  placeholder='Product Care Instructions' />
        </div>

        {/* Product Features */}
        <div>
  
          <input {...register('productFeatures')} placeholder='Product Features (comma separated)'/>
        </div>
        </div>
        <div className="section-desc varinat">

  <div className="desc-container">
    <label className="variant-toggle-label">
      Do This Product Have Variants?
      <div className="switch">
        <input
          type="checkbox"
          checked={showVariants}
          onChange={() => setShowVariants(prev => !prev)}
        />
        <span className="slider round"></span>
      </div>
    </label>
  </div>
</div>{showVariants && (
  <div className="variant-section">
    <Controller
      control={control}
      name="variants"
      render={({ field }) => (
        <>
          {(field.value ?? []).map((variant, idx) => (
            <div key={idx} className="variant-row">
              <div className="varinat-input">
              <input
                placeholder="Variant Name (e.g. Size)"
                value={variant.name}
                onChange={e => {
                  const newVariants = [...(field.value ?? [])];
                  newVariants[idx].name = e.target.value;
                  field.onChange(newVariants);
                }}
              />
              <input
                placeholder="Variant Values (e.g. S,M,L)"
                value={variant.value}
                onChange={e => {
                  const newVariants = [...(field.value ?? [])];
                  newVariants[idx].value = e.target.value;
                  field.onChange(newVariants);
                }}
              />
              </div>

                 <div className="varinatbuttons">
  <button
                type="button"
                onClick={() => {
                  const newVariants = (field.value ?? []).filter((_, i) => i !== idx);
                  field.onChange(newVariants);
                }}
                className='background-button'
              >
                Cancel
              </button>
          <button
            type="button"
            onClick={() => field.onChange([...(field.value ?? []), { name: '', value: '' }])}
            className='bordered-button'
          >
            Add Variant
          </button>
          </div>
              
            </div>
            
          ))}
          
     
        </>
      )}
    />
  </div>
)}

         </div>
         
       </div>
       <div className="right-side">
        <div className="product-imagesection">
 <div className="desc-heading">
            <h2>Product Images</h2>
          </div>

      <div className="image-conatainers">
  <div
    className="container1"
    onClick={() => document.getElementById('fileInput0')?.click()}
  >
    {selectedFiles[0] ? (
      <img
        src={URL.createObjectURL(selectedFiles[0])}
        alt="preview-0"
        className="image-preview"
      />
    ) : (
      <>
        <p>Click to Upload</p>
        <span>or drag and drop</span>
      </>
    )}
    <input
      id="fileInput0"
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          setSelectedFiles((prev) => {
            const updated = [...prev];
            updated[0] = file;
            return updated;
          });
        }
      }}
    />
  </div>
 {/* <div>
          <label>Upload Product Images *</label><br />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onFilesChange}
            disabled={uploading || isSubmitting}
          />
          {selectedFiles.length > 0 && (
            <div>
              <p>Selected files:</p>
              <ul>
                {selectedFiles.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div> */}
  <div
    className="container1"
    onClick={() => document.getElementById('fileInput1')?.click()}
  >
    {selectedFiles[1] ? (
      <img
        src={URL.createObjectURL(selectedFiles[1])}
        alt="preview-1"
        className="image-preview"
      />
    ) : null}
    <input
      id="fileInput1"
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          setSelectedFiles((prev) => {
            const updated = [...prev];
            updated[1] = file;
            return updated;
          });
        }
      }}
    />
  </div>

  <div className="container-space">
    <div
      className="container2"
      onClick={() => document.getElementById('fileInput2')?.click()}
    >
      {selectedFiles[2] ? (
        <img
          src={URL.createObjectURL(selectedFiles[2])}
          alt="preview-2"
          className="image-preview"
        />
      ) : null}
      <input
        id="fileInput2"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setSelectedFiles((prev) => {
              const updated = [...prev];
              updated[2] = file;
              return updated;
            });
          }
        }}
      />
    </div>

    <div
      className="container2"
      onClick={() => document.getElementById('fileInput3')?.click()}
    >
      {selectedFiles[3] ? (
        <img
          src={URL.createObjectURL(selectedFiles[3])}
          alt="preview-3"
          className="image-preview"
        />
      ) : null}
      <input
        id="fileInput3"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setSelectedFiles((prev) => {
              const updated = [...prev];
              updated[3] = file;
              return updated;
            });
          }
        }}
      />
    </div>
  </div>
</div>

          
      
        </div>
           <div className="section-desc'">
             <div className="desc-heading">
            <h2>Shipping & Measurements Details</h2>
          </div>

         
         <div className="desc-container">
          <div>
          
          <input type="number" step="0.01" {...register('itemWeight', { required: 'Item Weight is required', valueAsNumber: true })} placeholder='Item Weight' />
          {errors.itemWeight && <p style={{color: 'red'}}>{errors.itemWeight.message}</p>}
        </div>
        <div className="packaging">
  <div className="input-with-unit">
  <input
    type="number"
    step="0.01"
    {...register('packageLength', { valueAsNumber: true })}
    placeholder="Length"
  />
  <span className="unit">in</span>
</div>

  <div className="input-with-unit">
    <input
      type="number"
      step="0.01"
      {...register('packageWidth', { valueAsNumber: true })}
      placeholder="Width (in)"
    />
      <span className="unit">in</span>
  </div>

  <div className="input-with-unit">
    <input
      type="number"
      step="0.01"
      {...register('packageHeight', { valueAsNumber: true })}
      placeholder="Height (in)"
    />
      <span className="unit">in</span>
  </div>
        </div>
         </div>
</div>
   <div className="section-desc'">
             <div className="desc-heading">
            <h2>Pricing</h2>
          </div>

         
         <div className="desc-container">
          <div className="price-container">
             <div className='price-con'>
              <p> $ </p>

  <input type="number" placeholder='Actual Price(MRP)' step="0.01" {...register('price', { required: 'Price is required', valueAsNumber: true })} />
  {errors.price && <p style={{color: 'red'}}>{errors.price.message}</p>}
</div>

{/* Original Price */}
<div className='price-con'>
  <p> $ </p>
  <input type="number" placeholder='Original Price' step="0.01" {...register('originalPrice', { valueAsNumber: true })} />
</div>
          </div>
        
         </div>
         </div>
          <div className='section-desc'>
          <div className="desc-heading">
            <h2>Inventory</h2>
          </div>
         <div className="desc-container">
             <div className="paer1">
          <div>
       
          <input {...register('sku', { required: 'SKU is required' })} placeholder='SKU' />
          {errors.sku && <p style={{color: 'red'}}>{errors.sku.message}</p>}
        </div>

        {/* Stock */}
        <div>
      
          <input type="number" {...register('stock', { required: 'Stock is required', valueAsNumber: true })} placeholder='Stock' />
          {errors.stock && <p style={{color: 'red'}}>{errors.stock.message}</p>}
        </div>
</div>
 <div className="paer1">
        {/* Unit */}
        <div>
        
          <input {...register('unit', { required: 'Unit is required' })} placeholder='Unit' />
          {errors.unit && <p style={{color: 'red'}}>{errors.unit.message}</p>}
        </div>

        
        <div>
   
          <input {...register('deliveryEta')} placeholder='Delivery ETA' />
        </div>
        </div>

        {/* Dispatch Time in Days */}
         <div className="paer1">
        <div>
     
          <input type="number" {...register('dispatchTimeInDays', { valueAsNumber: true })} placeholder='Dispatch Time(days)' />
        </div>

        {/* Shipping Cost */}
        <div>
       
          <input type="number" step="0.01" {...register('shippingCost', { valueAsNumber: true })} placeholder='Shipping Cost' />
        </div>
        </div>
         </div>
         </div>
       </div>
        </div>
      
        
     
      </form>

 <Toaster position="top-right" />
    </div>
  );
};

export default CreateProductPage;
