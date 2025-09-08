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
type CreateProductProps = {
  productId?: string;
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
returnPolicyType: 'REFUND' | 'REPLACEMENT';
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
   // ...existing fields
  listings?: {
    id?: string; // <-- Add this
    price: number;
    originalPrice?: number;
    stock: number;
    unit: string;
    itemWeight: number;
    packageLength?: number;
    packageWidth?: number;
    packageHeight?: number;
    deliveryEta?: string;
    dispatchTimeInDays?: number;
    shippingCost?: number;
    returnPolicyType: 'REFUND' | 'REPLACEMENT';
    sku: string;
  }[];
};


const CreateProduct: React.FC<CreateProductProps> = ({ productId }) => {
   const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
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
  if (!productId) return;

  async function fetchProduct() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://product-service-23pc.onrender.com/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const productData = response.data.data;
     
      setExistingImageUrls(productData.imageUrls || []);
const listing = productData.listings?.[0] || {};

reset({
  ...productData,
  ...listing,
    listings: [{ ...listing }],
  includedComponents: productData.includedComponents || [''],
  productFeatures: productData.productFeatures || [''],
  variants: productData.variants || [{ name: '', value: '' }],
  itemWeight: parseFloat(listing.itemWeight) || 0,
  packageLength: parseFloat(listing.packageLength) || undefined,
  packageWidth: parseFloat(listing.packageWidth) || undefined,
  packageHeight: parseFloat(listing.packageHeight) || undefined,
  price: parseFloat(listing.price) || 0,
  originalPrice: parseFloat(listing.originalPrice) || undefined,
  stock: parseInt(listing.stock) || 0,
  shippingCost: parseFloat(listing.shippingCost) || undefined,
  dispatchTimeInDays: parseInt(listing.dispatchTimeInDays) || undefined,
});


      // Set existing images (if needed)
      // You can fetch image URLs if your backend returns them
      // setSelectedFiles(...) if you store images by URLs
    } catch (err) {
      console.error('Failed to fetch product', err);
      toast.error('Failed to fetch product data.');
    }
  }

  fetchProduct();
}, [productId, reset]);
useEffect(() => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token);  // <-- Log token here
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      console.log('Decoded token:', decoded); // <-- Log decoded token here
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
      toast.error('You must be logged in');
      return;
    }

    const toArray = (value: string | string[] | undefined) =>
      Array.isArray(value)
        ? value.map(s => s.trim()).filter(Boolean)
        : (value ?? '').split(',').map(s => s.trim()).filter(Boolean);

    // ✅ Step 1: Prepare ALL image Base64 uploads BEFORE the API call
    const base64Images: string[] = await Promise.all(
      selectedFiles.map(file => fileToBase64(file))
    );

    // ✅ Step 2: Create or Update based on productId
    if (productId) {
      // Update existing product
      const payload = {
        ...data,
        includedComponents: toArray(data.includedComponents),
        productFeatures: toArray(data.productFeatures),
        variants: data.variants?.filter(v => v.name && v.value) || [],
        // ✅ Include the base64Images in the update payload
        images: base64Images.length > 0 ? base64Images : undefined,
        listings: [{
          id: data.listings?.[0]?.id,
          price: data.price,
          originalPrice: data.originalPrice,
          stock: data.stock,
          unit: data.unit,
          itemWeight: data.itemWeight,
          packageLength: data.packageLength,
          packageWidth: data.packageWidth,
          packageHeight: data.packageHeight,
          deliveryEta: data.deliveryEta,
          dispatchTimeInDays: data.dispatchTimeInDays,
          shippingCost: data.shippingCost,
          sku: data.sku,
        }],
      };

      await axios.put(
        `https://product-service-23pc.onrender.com/api/products/${productId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Product updated successfully!');
      router.push(`/dashboard/store/${productId}`);
    } else {
      // Create new product
      const createPayload = {
        ...data,
        includedComponents: toArray(data.includedComponents),
        productFeatures: toArray(data.productFeatures),
        variants: data.variants?.filter(v => v.name && v.value) || [],
        // ✅ The crucial change: send all images in the initial create payload
        images: base64Images,
        listings: [{
          price: data.price,
          originalPrice: data.originalPrice,
          stock: data.stock,
          unit: data.unit,
          itemWeight: data.itemWeight,
          packageLength: data.packageLength,
          packageWidth: data.packageWidth,
          packageHeight: data.packageHeight,
          deliveryEta: data.deliveryEta,
          dispatchTimeInDays: data.dispatchTimeInDays,
          shippingCost: data.shippingCost,
          sku: data.sku,
        }],
      };

      await axios.post(
        `https://product-service-23pc.onrender.com/api/products`,
        createPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Product created with images!');
      reset();
      setSelectedFiles([]);
      router.push('/dashboard/store');
    }

  } catch (err: any) {
    console.error(err);
    toast.error(err?.response?.data?.message || 'Something went wrong');
  } finally {
    setUploading(false);
  }
};

 const handleBackClick = () => {
    if (productId) {
      // In EDIT mode, navigate to the specific product's detail page
      router.push(`/dashboard/store/${productId}`);
    } else {
      // In CREATE mode, navigate to the main store page
      router.push('/dashboard/store');
    }
  };

  const handleDiscard = () => {
    // For both create and edit mode, reset the form and go to the main store page
    reset();
    setSelectedFiles([]);
    router.push('/dashboard/store');
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
    <div className='mainproductpage'>
     <div className="producst-main">
        
     <div className="product-headerleft">
     <button className='bordered-button' type="button" onClick={handleBackClick}>
  <ChevronLeft />
</button>

     <div className='title-sect'>
  <p>Products</p>
  <h2 className='product-input'>
    {productId ? 'Edit Product' : 'Add A New Product'}
  </h2>
</div>


     </div>
     <div className="product-headerright">
    
       <button
  className='discard-b'
  type="button"
  onClick={() => {
    reset(); // reset form fields
    setSelectedFiles([]);
    handleDiscard(); // reset selected images
    // or '/dashboard'
  }}
>
  Discard
</button>

      <button
  type="submit"
  className='background-button'
  disabled={isSubmitting}
  onClick={handleSubmit(onSubmit)}
>
  {productId ? 'Update Product' : 'Add Product'} <PlusIcon />
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
         <label>Product Name</label>
          <input {...register('title', { required: 'Title is required' })} placeholder='Product Name' />
          {errors.title && <p style={{color: 'red'}}>{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
         <label>Description</label>
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
        <label>Subcategory</label>
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
         <label>Brand</label>
          <input {...register('brand')} placeholder='Brand' />
        </div>

        {/* Included Components */}
         <div>
        <label>No of items</label>
          <input type="number" {...register('numberOfItems', { valueAsNumber: true })} placeholder='Number of Items' />
        </div>
       
          </div>
               <div className="paer1">
  <div>
         <label>Included Components (comma separated)</label>
          <input {...register('includedComponents')} placeholder='Included Components (comma separated)'/>
        </div>

        {/* Enclosure Material */}
       
               </div>

 <div>
         <label>Enclosure Material</label>
          <input {...register('enclosureMaterial')} placeholder='Enclosure Material' />
        </div>
        
        

        {/* Number of Items */}
      

        {/* Product Care Instructions */}
    
        <label>Product Care Instructions</label>
          <input {...register('productCareInstructions')}  placeholder='Product Care Instructions' />
       

        {/* Product Features */}
        <div>
          <label>Product Features (comma separated)</label>
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
      alt="preview-1"
      className="image-preview"
    />
  ) : existingImageUrls[0] ? (
    <img
      src={existingImageUrls[0]}
      alt="existing-preview-1"
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
  ) : existingImageUrls[1] ? (
    <img
      src={existingImageUrls[1]}
      alt="existing-preview-1"
      className="image-preview"
    />
  ) : (
    <>
      <p>Click to Upload</p>
      <span>or drag and drop</span>
    </>
  )}
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
      alt="preview-1"
      className="image-preview"
    />
  ) : existingImageUrls[2] ? (
    <img
      src={existingImageUrls[2]}
      alt="existing-preview-1"
      className="image-preview"
    />
  ) : (
    <>
      <p>Click to Upload</p>
      <span>or drag and drop</span>
    </>
  )}
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
      alt="preview-1"
      className="image-preview"
    />
  ) : existingImageUrls[3] ? (
    <img
      src={existingImageUrls[3]}
      alt="existing-preview-1"
      className="image-preview"
    />
  ) : (
    <>
      <p>Click to Upload</p>
      <span>or drag and drop</span>
    </>
  )}
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
            <label>Item Weight</label>
          
          <input type="number" step="0.01" {...register('itemWeight', { required: 'Item Weight is required', valueAsNumber: true })} placeholder='Item Weight' />
          {errors.itemWeight && <p style={{color: 'red'}}>{errors.itemWeight.message}</p>}
        </div>
        <div className="packaging">
          <div className="columnwidth">
            <label>Length</label>
  <div className="input-with-unit">
    
  <input
    type="number"
    step="0.01"
    {...register('packageLength', { valueAsNumber: true })}
    placeholder="Length"
  />
  <span className="unit">in</span>
</div>
</div>
<div className="columnwidth">
  <label>Width (in)</label>
  <div className="input-with-unit">
    
    <input
      type="number"
      step="0.01"
      {...register('packageWidth', { valueAsNumber: true })}
      placeholder="Width (in)"
    />
      <span className="unit">in</span>
  </div>
  </div>
<div className="columnwidth">
   <label>Height (in)</label>
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
         <label>SKU</label>
          <input {...register('sku', { required: 'SKU is required' })} placeholder='SKU' />
          {errors.sku && <p style={{color: 'red'}}>{errors.sku.message}</p>}
        </div>

        {/* Stock */}
        <div>
        <label>Stock</label>
          <input type="number" {...register('stock', { required: 'Stock is required', valueAsNumber: true })} placeholder='Stock' />
          {errors.stock && <p style={{color: 'red'}}>{errors.stock.message}</p>}
        </div>
</div>
 <div className="paer1">
        {/* Unit */}
        <div>
          <label>Unit</label>
          <input {...register('unit', { required: 'Unit is required' })} placeholder='Unit' />
          {errors.unit && <p style={{color: 'red'}}>{errors.unit.message}</p>}
        </div>

        
        <div>
        <label>Delivery ETA</label>
          <input {...register('deliveryEta')} placeholder='Delivery ETA' />
        </div>
        </div>

        {/* Dispatch Time in Days */}
         <div className="paer1">
        <div>
         <label>Dispatch Time(days)</label>
          <input type="number" {...register('dispatchTimeInDays', { valueAsNumber: true })} placeholder='Dispatch Time(days)' />
        </div>

        {/* Shipping Cost */}
        <div>
       <label>Shipping Cost</label>
          <input type="number" step="0.01" {...register('shippingCost', { valueAsNumber: true })} placeholder='Shipping Cost' />
        </div>
     
        </div>
           <div className='replacement'>
  <div className="desc-heading">
    <h2>Return Policy</h2>
  </div>
<div className="desc-container">
  <div className="radio-group">
    <div className='replace'>
      <input
        type="radio"
        value="REFUND"
        {...register('returnPolicyType', { required: 'Return policy is required' })}
        className="radio-input"
      />
      <label>Product Can Be Refunded</label>  {/* <-- Corrected label */}
    </div>
    <div className='replace'>
      <input
        type="radio"
        value="REPLACEMENT"
        {...register('returnPolicyType', { required: 'Return policy is required' })}
        className="radio-input"
      />
      <label>Product Can Be Replaced</label>
    </div>
  </div>
  {errors.returnPolicyType && <p style={{ color: 'red' }}>{errors.returnPolicyType.message}</p>}
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

export default CreateProduct;
