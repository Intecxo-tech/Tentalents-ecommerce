import React from 'react'
import Link from 'next/link';
import { MapPin, MenuIcon } from 'lucide-react';
import './menu.css'
const Menu = () => {
  return (
    <div className="menutop">
      <div className="menu-left">
       <Link href="/">
          <span className="logo">Tentalents</span>
        </Link>
        
</div>
<div className="menu-right">
  <button className='bordered-button'>Menu <MenuIcon /></button>
</div>
    </div>

  )
}

export default Menu