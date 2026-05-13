import { useState, useEffect } from 'react';
import { supabase } from './supabase.mobile';

const useFeatureFlags = () => {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlags = async () => {
      const { data, error } = await supabase.from('feature_flags').select('name, is_enabled');
      
      // Suppress 406 errors (table doesn't exist) - feature_flags is optional
      if (error && error.status === 406) {
        setLoading(false);
        return;
      }
      
      if (!error && data) {
        const flagMap = {};
        data.forEach(f => { flagMap[f.name] = f.is_enabled; });
        setFlags(flagMap);
      }
      setLoading(false);
    };

    fetchFlags();

    // Subscribe to feature flag updates in realtime
    const channel = supabase.channel('public:feature_flags')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feature_flags' }, () => {
        fetchFlags();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { flags, loading };
};

export default useFeatureFlags;
