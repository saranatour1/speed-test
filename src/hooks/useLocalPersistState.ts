import { useState, useEffect } from "react";

const useLocalPersistState = (defaultValue:string, key:string) => {
  const [value, setValue] = useState<string>(() => {
    const persistValue = window.localStorage.getItem(key);
    return persistValue !== null && persistValue !== "undefined"? JSON.parse(persistValue) : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

export default useLocalPersistState;