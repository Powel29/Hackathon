import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { AlertCircle } from 'lucide-react';

const libraries = ['places'];
const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '0.5rem'
};
const defaultCenter = {
    lat: 20.5937, // default to India center roughly
    lng: 78.9629
};

const MapAddressPicker = ({ onAddressSelect, initialAddress }) => {
    const [markerPos, setMarkerPos] = useState(defaultCenter);
    const [addressText, setAddressText] = useState(initialAddress || '');
    const [isResolving, setIsResolving] = useState(false);
    const mapRef = useRef();

    // Fallback since script is global
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(false);

    const MAX_WAIT_MS = 10_000; // give Maps script up to 10 s to load

    useEffect(() => {
        // Dynamically inject the Google Maps script if not already present.
        // We do this in React (not index.html) so that import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        // is substituted correctly by Vite's build step, working in both dev and production.
        const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!document.querySelector('script[data-maps-injected]')) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&loading=async&libraries=places`;
            script.async = true;
            script.setAttribute('data-maps-injected', 'true');
            document.head.appendChild(script);
        }

        const checkGoogle = setInterval(() => {
            if (window.google && window.google.maps) {
                setIsLoaded(true);
                clearInterval(checkGoogle);
                clearTimeout(giveUp);
            }
        }, 100);

        // Timeout: stop polling and show an error if Maps never arrives
        const giveUp = setTimeout(() => {
            clearInterval(checkGoogle);
            setLoadError(true);
        }, MAX_WAIT_MS);

        return () => {
            clearInterval(checkGoogle);
            clearTimeout(giveUp);
        };
    }, []);

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
        // Attempt to get user's current location if no initial address
        if (navigator.geolocation && !initialAddress) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setMarkerPos(pos);
                    map.panTo(pos);
                    map.setZoom(15);
                    resolveAddress(pos.lat, pos.lng);
                },
                () => {
                    console.log("Geolocation failed or denied.");
                }
            );
        }
    }, [initialAddress]);

    const resolveAddress = async (lat, lng) => {
        setIsResolving(true);
        try {
            const geocoder = new window.google.maps.Geocoder();
            const response = await geocoder.geocode({ location: { lat, lng } });

            let results = response?.results || (Array.isArray(response) ? response : []);

            if (results && results.length > 0) {
                const result = results[0];
                setAddressText(result.formatted_address);

                // Parse address components
                let city = '';
                let state = '';
                let pincode = '';

                for (const component of result.address_components) {
                    const types = component.types;
                    if (types.includes('locality')) {
                        city = component.long_name;
                    } else if (types.includes('administrative_area_level_1')) {
                        state = component.long_name;
                    } else if (types.includes('postal_code')) {
                        pincode = component.long_name;
                    }
                }

                // Pass resolved data up
                if (onAddressSelect) {
                    onAddressSelect({
                        formattedAddress: result.formatted_address,
                        city,
                        state,
                        pincode,
                        lat,
                        lng
                    });
                }
            }
        } catch (error) {
            console.error("Geocoding failed:", error);
        } finally {
            setIsResolving(false);
        }
    };

    const onMapClick = useCallback((e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPos({ lat, lng });
        resolveAddress(lat, lng);
    }, []);

    const onMarkerDragEnd = useCallback((e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPos({ lat, lng });
        resolveAddress(lat, lng);
    }, []);

    if (loadError) {
        return (
            <div className="p-12 bg-red-50 border border-red-200 border-dashed rounded-xl flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-red-500 font-medium">Google Maps failed to load.</p>
                <p className="text-gray-400 text-sm">Please check your connection or API key and refresh the page.</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="p-12 bg-gray-50 border border-gray-200 border-dashed rounded-xl flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0066CC] rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Initializing Google Maps...</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="border border-gray-300 rounded-lg overflow-hidden relative">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={5}
                    center={markerPos}
                    onClick={onMapClick}
                    onLoad={onMapLoad}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                    }}
                >
                    <Marker
                        position={markerPos}
                        draggable={true}
                        onDragEnd={onMarkerDragEnd}
                    />
                </GoogleMap>
                {isResolving && (
                    <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded shadow text-xs font-semibold text-gray-600 flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-[#0066CC] border-t-transparent rounded-full animate-spin"></div>
                        Resolving...
                    </div>
                )}
            </div>

            {addressText && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-sm text-gray-700"><strong>Selected Location:</strong> {addressText}</p>
                    <p className="text-xs text-gray-500 mt-1">Review the auto-filled address details below and adjust if necessary.</p>
                </div>
            )}
        </div>
    );
};

export default MapAddressPicker;
