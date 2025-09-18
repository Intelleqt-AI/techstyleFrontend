import Image from 'next/image';
import { useState } from 'react';

export default function ProductImage({ src, alt, className = '', ...props }) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc || '/product-placeholder-wp.jpg'}
      alt={alt || 'Product image'}
      width={400}
      height={400}
      className={className}
      onError={() => setImgSrc('/product-placeholder-wp.jpg')}
      {...props}
    />
  );
}
