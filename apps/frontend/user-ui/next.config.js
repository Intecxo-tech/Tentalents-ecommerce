//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const baseConfig = {
  nx: {
    // Enable SVGR if needed
    svgr: false,
  },

  // ✅ Important: Ensure .next is generated inside dist folder for deployment (like on Vercel)
  // distDir: '../../dist/apps/frontend/user-ui/.next',

  images: {
    domains: [
      'lh3.googleusercontent.com',
      'www.cotstyle.com',
      'www.lapcare.com',
      'm.media-amazon.com',
      'countrybean.in',
      'images-cdn.ubuy.co.in',
      'masterindia.in',
      'encrypted-tbn0.gstatic.com',
      'images.meesho.com',
      'gravatar.com',
      'example.com',
      'image.made-in-china.com',
      'cdn.moglix.com',
      'assets.myntassets.com',
      'i5.walmartimages.com',
      'www.oem-india.com',
      'cdn01.pharmeasy.in',
      'media.istockphoto.com',
      'res.cloudinary.com',
      'localhost',
    ],
  },
};

// Compose plugins
const plugins = [
  withNx,
  // Add other Next.js plugins here if needed
];

module.exports = composePlugins(...plugins)(baseConfig);
