import imageCompression from 'browser-image-compression';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/firebase';

export const compressImage = async (file: File): Promise<File> =>
  imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    initialQuality: 0.8,
    useWebWorker: true,
  });

export const dataURLToFile = (dataURL: string, filename: string): File => {
  const [header, data = ''] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(data);
  const array: number[] = [];

  for (let index = 0; index < binary.length; index += 1) {
    array.push(binary.charCodeAt(index));
  }

  return new File([new Uint8Array(array)], filename, { type: mime });
};

export const uploadImageToStorage = (file: File, uid: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const storageRef = ref(storage, `/profile_pictures/${uid}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      undefined,
      (error) => reject(error),
      async () => {
        try {
          resolve(await getDownloadURL(uploadTask.snapshot.ref));
        } catch (error) {
          reject(error);
        }
      }
    );
  });
