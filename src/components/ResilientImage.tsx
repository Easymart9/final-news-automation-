'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

const FALLBACK_IMAGE = '/news-placeholder.svg';

export function ResilientImage({ onError, src, ...props }: ImageProps) {
  const sourceKey = typeof src === 'string' ? src : 'src' in src ? src.src : src.default.src;
  const [failedSource, setFailedSource] = useState<string | null>(null);

  return (
    <Image
      {...props}
      alt={props.alt}
      src={failedSource === sourceKey ? FALLBACK_IMAGE : src}
      onError={event => {
        setFailedSource(sourceKey);
        onError?.(event);
      }}
    />
  );
}
