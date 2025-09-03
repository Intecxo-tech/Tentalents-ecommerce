import { Upload } from 'lucide-react'
import React from 'react'
import '../signup/signup.css'
const page = () => {
  return (
    <div>
      <div className='upload-field'>
        <h2>Upload Incorporation certificate</h2>
        <Upload className='signup-cion' size={35} />
      </div>
    </div>
  )
}

export default page
