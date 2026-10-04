// All demo illustrations are local SVGs: no image server is needed in Android.
export default function LocalImage({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  unoptimized?: boolean;
}) {
  // oxlint-disable-next-line next/no-img-element
  return <img src={src} alt={alt} width={width} height={height} />;
}
