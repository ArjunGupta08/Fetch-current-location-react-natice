import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from 'react-hook-form';

const LocationSelectionScreen = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState({
    countries: false,
    states: false,
    cities: false,
    location: false,
  });

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      country: '',
      state: '',
      city: '',
      locality: '',
      pinCode: '',
      address: '',
    },
  });

  const selectedCountry = watch('country');
  const selectedState = watch('state');

  const [location, setLocation] = useState(null);

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry);
      setValue('state', '');
      setValue('city', '');
    }
  }, [selectedCountry]);

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedState && selectedCountry) {
      fetchCities(selectedCountry, selectedState);
      setValue('city', '');
    }
  }, [selectedState]);

  const fetchCountries = async () => {
    setLoading(prev => ({ ...prev, countries: true }));
    try {
      // Using REST Countries API - free and no API key required
      const response = await axios.get('https://restcountries.com/v3.1/independent?status=true');
      const countriesData = response.data
        .map(country => ({
          name: country.name.common,
          code: country.cca2,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setCountries(countriesData);
    } catch (error) {
      console.error('Error fetching countries:', error);
      Alert.alert('Error', 'Failed to fetch countries');
    } finally {
      setLoading(prev => ({ ...prev, countries: false }));
    }
  };

  const fetchStates = async (countryName) => {
    setLoading(prev => ({ ...prev, states: true }));
    try {
      // Using CountriesNow API for states
      const response = await axios.post('https://countriesnow.space/api/v0.1/countries/states', {
        country: countryName,
      });

      if (response.data.data?.states) {
        const statesData = response.data.data.states
          .map(state => ({ name: state.name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setStates(statesData);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      Alert.alert('Error', 'Failed to fetch states');
    } finally {
      setLoading(prev => ({ ...prev, states: false }));
    }
  };

  const fetchCities = async (countryName, stateName) => {
    setLoading(prev => ({ ...prev, cities: true }));
    try {
      // Using CountriesNow API for cities
      const response = await axios.post('https://countriesnow.space/api/v0.1/countries/state/cities', {
        country: countryName,
        state: stateName,
      });

      if (response.data.data) {
        const citiesData = response.data.data
          .sort((a, b) => a.localeCompare(b))
          .map(city => ({ name: city }));
        setCities(citiesData);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      Alert.alert('Error', 'Failed to fetch cities');
    } finally {
      setLoading(prev => ({ ...prev, cities: false }));
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(prev => ({ ...prev, location: true }));

      GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      })
        .then(location => {
          console.log(location);
        })
        .catch(error => {
          const { code, message } = error;
          console.warn(code, message);
        })

      // if (loc) {
      //   setLocation(loc);
      //   await reverseGeocode(loc.latitude, loc.longitude); // ✅ use loc instead of state
      // } else {
      //   console.warn('No location found');
      // }
    } catch (err) {
      console.error('Error fetching location:', err);
    } finally {
      setLoading(prev => ({ ...prev, location: false }));
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );

      const address = response.data.address;

      // Set form values based on reverse geocoding data
      if (address.country) {
        setValue('country', address.country);
      }
      if (address.state) {
        setValue('state', address.state);
      }
      if (address.city || address.town || address.village) {
        setValue('city', address.city || address.town || address.village);
      }
      if (address.suburb) {
        setValue('locality', address.suburb);
      }
      if (address.postcode) {
        setValue('pinCode', address.postcode);
      }

      // Set complete address
      setValue('address', response.data.display_name);

    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      Alert.alert('Error', 'Failed to get address from location');
    } finally {
      setLoading(prev => ({ ...prev, location: false }));
    }
  };

  const onSubmit = (data) => {
    console.log('Location data:', data);
    Alert.alert('Success', 'Location saved successfully!');
    // Handle form submission here
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Select Your Location</Text>

      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={getCurrentLocation}
        disabled={loading.location}
      >
        {loading.location ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.locationButtonText}>📌 Get Current Location</Text>
        )}
      </TouchableOpacity>

      {/* Country Dropdown */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Country</Text>
        <Controller
          control={control}
          name="country"
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
                enabled={!loading.countries}
              >
                <Picker.Item label="Select Country" value="" />
                {countries.map((country) => (
                  <Picker.Item
                    key={country.code}
                    label={country.name}
                    value={country.name}
                  />
                ))}
              </Picker>
              {loading.countries && (
                <ActivityIndicator style={styles.pickerLoader} />
              )}
            </View>
          )}
        />
      </View>

      {/* State Dropdown */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>State</Text>
        <Controller
          control={control}
          name="state"
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
                enabled={!!selectedCountry && !loading.states}
              >
                <Picker.Item label="Select State" value="" />
                {states.map((state, index) => (
                  <Picker.Item
                    key={index}
                    label={state.name}
                    value={state.name}
                  />
                ))}
              </Picker>
              {loading.states && (
                <ActivityIndicator style={styles.pickerLoader} />
              )}
            </View>
          )}
        />
      </View>

      {/* City Dropdown */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>City</Text>
        <Controller
          control={control}
          name="city"
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
                enabled={!!selectedState && !loading.cities}
              >
                <Picker.Item label="Select City" value="" />
                {cities.map((city, index) => (
                  <Picker.Item
                    key={index}
                    label={city.name}
                    value={city.name}
                  />
                ))}
              </Picker>
              {loading.cities && (
                <ActivityIndicator style={styles.pickerLoader} />
              )}
            </View>
          )}
        />
      </View>

      {/* Locality Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Locality/Area</Text>
        <Controller
          control={control}
          name="locality"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.textInput}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Enter your locality"
            />
          )}
        />
      </View>

      {/* PIN Code Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>PIN Code</Text>
        <Controller
          control={control}
          name="pinCode"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.textInput}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Enter PIN code"
              keyboardType="numeric"
              maxLength={6}
            />
          )}
        />
      </View>

      {/* Complete Address */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Complete Address</Text>
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.textInput, styles.textArea]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Enter your complete address"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          )}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.submitButtonText}>Save Location</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
  },
  picker: {
    height: 50,
  },
  pickerLoader: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    fontSize: 16,
    height: 50,
  },
  textArea: {
    height: 100,
  },
  locationButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LocationSelectionScreen;