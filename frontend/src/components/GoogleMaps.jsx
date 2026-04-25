import { useEffect, useRef } from "react";

const GoogleMapsAutocompleteInput = ({ placeholder, onPlaceSelected }) => {
  const containerRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || autocompleteRef.current) return;

    const element = document.createElement("gmpx-place-autocomplete");
    element.setAttribute("placeholder", placeholder || "Enter a location");
    element.setAttribute(
      "class",
      "w-full h-12 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    );

    element.addEventListener("gmpx-placeautocomplete-select", async (e) => {
      const place = e.detail?.place;
      if (onPlaceSelected) {
        onPlaceSelected({
          id: place.id,
          displayName: place.displayName?.text,
          formattedAddress: place.formattedAddress,
          location: place.location,
        });
      }
    });

    containerRef.current.appendChild(element);
    autocompleteRef.current = element;
  }, [placeholder, onPlaceSelected]);
  
  return <div ref={containerRef} className="w-full" />;
};

export default GoogleMapsAutocompleteInput;
