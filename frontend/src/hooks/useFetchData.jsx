import { useEffect, useState } from "react";

const useFetchData = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const fetchData = async () => {
      const token = localStorage.getItem('token');
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message + ' 🤨');
        }

        if (ignore) return;
        setData(result.data);
        setLoading(false);
      } catch (err) {
        if (ignore || err.name === 'AbortError') return;
        setLoading(false);
        setError(err.message);
      }
    };

    fetchData();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [url]);

  return { data, loading, error };
};

export default useFetchData;
