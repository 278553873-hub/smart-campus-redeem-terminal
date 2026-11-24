import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_MOBILE_PHOTO_LIMIT } from '../components/ui/mobileInputLimits';

interface TeacherRecordPhoto {
    id: string;
    url: string;
    file: File;
}

export function useTeacherRecordPhotos(scopeKey: string) {
    const [cameraOpen, setCameraOpen] = useState(false);
    const [photos, setPhotos] = useState<TeacherRecordPhoto[]>([]);
    const urls = useRef(new Set<string>());
    const releasePhotos = useCallback(() => {
        urls.current.forEach(url => URL.revokeObjectURL(url));
        urls.current.clear();
    }, []);
    const clearPhotos = useCallback(() => {
        releasePhotos();
        setPhotos(current => current.length ? [] : current);
    }, [releasePhotos]);

    useEffect(() => {
        setCameraOpen(false);
        clearPhotos();
    }, [scopeKey, clearPhotos]);
    useEffect(() => releasePhotos, [releasePhotos]);

    const remaining = DEFAULT_MOBILE_PHOTO_LIMIT - photos.length;
    const addPhotos = (files: File[]) => {
        const additions = files.slice(0, remaining).map(file => {
            const url = URL.createObjectURL(file);
            urls.current.add(url);
            return { id: url, url, file };
        });
        setPhotos(current => [...current, ...additions]);
        setCameraOpen(false);
    };
    const removePhoto = (id: string) => {
        if (urls.current.delete(id)) URL.revokeObjectURL(id);
        setPhotos(current => current.filter(photo => photo.id !== id));
    };

    return { photos, remaining, cameraOpen, setCameraOpen, addPhotos, removePhoto, clearPhotos };
}
