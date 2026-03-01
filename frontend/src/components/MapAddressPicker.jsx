import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
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
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries
    });

    const [markerPos, setMarkerPos] = useState(defaultCenter);
    const [addressText, setAddressText] = useState(initialAddress || '');
    const [isResolving, setIsResolving] = useState(false);
    const mapRef = useRef();

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

            if (response.results && response.results.length > 0) {
                const result = response.results[0];
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
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-red-900 mb-1">Maps Service Unavailable</h3>
                        <p className="text-sm text-red-700 leading-relaxed mb-4">
                            We're having trouble loading the interactive map. This can happen due to restricted network settings or browser extensions (like ad-blockers).
                        </p>
                        <div className="bg-white/50 p-3 rounded-lg border border-red-100 mb-4">
                            <p className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-1">How to proceed:</p>
                            <p className="text-sm text-red-800 italic">Please enter your address details manually in the form below. You can skip the map selection.</p>
                        </div>
                        <button
                            onClick={() => onAddressSelect && onAddressSelect({ manualMode: true })}
                            className="w-full py-2 bg-white border border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 transition-colors shadow-sm"
                        >
                            Continue with Manual Entry
                        </button>
                    </div>
                </div>
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
