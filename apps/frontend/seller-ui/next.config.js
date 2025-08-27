//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
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

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
