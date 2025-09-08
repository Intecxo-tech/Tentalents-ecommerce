import React from 'react'
import { categories, pages } from '../../configs/constants'
import Link from 'next/link'
import { ChevronRight, FacebookIcon,InstagramIcon,YoutubeIcon } from 'lucide-react'
const Footer = () => {
  return (
    <div className='footer-container'>
    <div className="footer">
       <div className="footer-part1">
       <h2>Tentalents</h2>
       <div className="searchbar">
           <input className="search-input" placeholder="Search Tentalents.in" />
            <div className="searchbutton">
              <ChevronRight className="search-icon" size={20} />
            </div>
       </div>
      
       </div>
        <div className="footer-part2">
        <h3>Categories</h3>
        {categories.map((i,index)=>(
            <div key={index} className="footer-category">
              <Link href={i.href}>
                <p>{i.title}</p>
              </Link>
            </div>
        ))

        }
       </div>
        <div className="footer-part3">
        <h3>Pages</h3>
        {pages.map((i,index)=>(
          <div key={index} className="footer-pages">
             <Link href={i.href}>
             <p>{i.title}</p>

             </Link>
          </div>
        ))

        }
        
       </div>
        <div className="footer-part4">
           <h3>UseFul Links</h3>
           <a href="#"><p>How to place Order</p></a>
             <a href="#"><p>Category</p></a>
               <a href="#"><p>Our Pages</p></a>

               <div className="social-media">
               <h3>Social Media Links</h3>
               <div className="social-icons">
                    <InstagramIcon className="socialicons" />
                     <FacebookIcon className="socialicons" />
                
                     <YoutubeIcon className="socialicons" />
               </div>
              

               </div>
       </div>
      
    </div>

    </div>
  )
}

export default Footer
