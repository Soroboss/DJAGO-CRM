import { useState, useCallback } from 'react';

interface GeolocationResult {
  loading: boolean;
  coordinates: string | null;
  error: string | null;
  getCurrentPosition: () => Promise<string>;
}

export const useGeolocation = (): GeolocationResult => {
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errMsg = "La géolocalisation n'est pas supportée par votre navigateur.";
        setError(errMsg);
        reject(errMsg);
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          setCoordinates(coords);
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          let errMsg = "Erreur de géolocalisation.";
          if (err.code === err.PERMISSION_DENIED) {
            errMsg = "Accès GPS refusé par l'utilisateur.";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errMsg = "Coordonnées GPS indisponibles.";
          } else if (err.code === err.TIMEOUT) {
            errMsg = "Délai d'attente GPS dépassé.";
          }
          setError(errMsg);
          setLoading(false);
          reject(errMsg);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  }, []);

  return { loading, coordinates, error, getCurrentPosition };
};
