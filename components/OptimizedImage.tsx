import React from 'react';

type OptimizedImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
  srcSet?: string;
  sizes?: string;
  webpSrc?: string;
  placeholderClassName?: string;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
};

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'auto',
  srcSet,
  sizes,
  webpSrc,
  placeholderClassName,
  onClick,
}) => {
  if (webpSrc) {
    return (
      <picture className={className}>
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={src}
          alt={alt}
          className={placeholderClassName}
          width={width}
          height={height}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
          srcSet={srcSet}
          sizes={sizes}
          onClick={onClick}
        />
      </picture>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      srcSet={srcSet}
      sizes={sizes}
      onClick={onClick}
    />
  );
};

export default OptimizedImage;
