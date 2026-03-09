interface PhotoUploaderProps {
  onChange: (urls: string[]) => void;
  maxCount?: number;
}

const PhotoUploader = ({ onChange, maxCount = 10 }: PhotoUploaderProps) => {
  return null;
};

export default PhotoUploader;
