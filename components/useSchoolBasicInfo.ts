import { useEffect, useState } from 'react';
import { readSchoolBasicInfo, schoolBasicInfoKey, SCHOOL_BASIC_INFO_CHANGED } from '../shared/schoolBasicInfoStore';

export const useSchoolBasicInfo = (schoolId: string, schoolName: string) => {
  const [state, setState] = useState(() => ({ schoolId, value: readSchoolBasicInfo(schoolId, schoolName) }));
  useEffect(() => {
    const reload = () => setState({ schoolId, value: readSchoolBasicInfo(schoolId, schoolName) });
    const onChange = (event: Event) => { if ((event as CustomEvent<{ schoolId: string }>).detail?.schoolId === schoolId) reload(); };
    const onStorage = (event: StorageEvent) => { if (!event.key || event.key === schoolBasicInfoKey(schoolId)) reload(); };
    reload();
    window.addEventListener(SCHOOL_BASIC_INFO_CHANGED, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SCHOOL_BASIC_INFO_CHANGED, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [schoolId, schoolName]);
  return state.schoolId === schoolId ? state.value : readSchoolBasicInfo(schoolId, schoolName);
};
