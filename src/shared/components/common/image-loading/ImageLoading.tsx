import { useSpring, animated } from '@react-spring/web';

interface ImageLoadingProps {
  borderRadius?: string;
}

const ImageLoading = ({ borderRadius }: ImageLoadingProps) => {
  const gradientAnimation = useSpring({
    from: { background: 'linear-gradient(to right, #f6f6f6 0%, #f6f6f6 100%)' },
    to: { background: 'linear-gradient(to right, lightgray 0%, #f6f6f6 100%)' },
    config: { duration: 1000 },
    loop: { reverse: true },
  });

  return (
    <animated.div
      className="image-loading"
      style={{
        ...gradientAnimation,
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        borderRadius,
      }}
    />
  );
};

export default ImageLoading;
