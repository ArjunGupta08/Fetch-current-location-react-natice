This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Welcome to React Native v0.77

- Fetching current location [lat, long]
    - using `npm install @react-native-community/geolocation`

    import Geolocation from '@react-native-community/geolocation';

    Geolocation.getCurrentPosition(
        pos => console.log(pos),
        err => console.log(err),
        { enableHighAccuracy: true }
    );

- Reverse geocode - extract address from `lat` and `long` 
    - Using public api (Free, Unlimited)
    - `https://nominatim.openstreetmap.org/reverse?lat=28.6936&lon=77.2146&format=json
    `
    const reverseGeocode = async (lat, lon) => {
        try {
            const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            );

            const data = await response.json();
            console.log("Address: ", data);

            return {
            street: data.address.road,
            city: data.address.city || data.address.town,
            state: data.address.state,
            country: data.address.country,
            pincode: data.address.postcode,
            fullAddress: data.display_name,
            };

        } catch (error) {
            console.log("Reverse Geocode Error: ", error);
        }
    };
