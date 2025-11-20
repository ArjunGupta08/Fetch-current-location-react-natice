import Geolocation from "@react-native-community/geolocation";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, ActivityIndicator, View, TouchableOpacity } from "react-native";

import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from 'react-hook-form';
import axios from "axios";

const { height, width } = Dimensions.get('window');

const LocationDropDown = () => {

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

            console.log('fetching countries:', countriesData);
            setCountries(countriesData);
        } catch (error) {
            console.error('Error fetching countries:', error);
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

                console.error('Fetching states:', statesData);
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

            console.error('Fetching cities:', cities);
        } catch (error) {
            console.error('Error fetching cities:', error);
            Alert.alert('Error', 'Failed to fetch cities');
        } finally {
            setLoading(prev => ({ ...prev, cities: false }));
        }
    };


    return (
        <View style={styles.container}>

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

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#432727ff',
        height: height,
        width: width
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#fff',
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
    }
});

export default LocationDropDown;