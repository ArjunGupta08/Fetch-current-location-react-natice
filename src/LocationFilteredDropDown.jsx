import React, { useEffect, useState } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    ActivityIndicator,
    View,
    TouchableOpacity,
    TextInput,
    ScrollView
} from "react-native";

import { useForm, Controller } from "react-hook-form";
import axios from "axios";

const { height, width } = Dimensions.get("window");

const LocationFilteredDropDown = () => {
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const [selectedState, setState] = useState('');

    const [filteredStates, setFilteredStates] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);

    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    const [loading, setLoading] = useState({
        states: false,
        cities: false,
    });

    const { control, watch, setValue } = useForm({
        defaultValues: {
            state: "",
            city: "",
        },
    });

    const stateTextChange = watch('state');

    
    // Fetch states on mount
    useEffect(() => {
        fetchStates("India");
    }, []);

    // Reset + fetch cities on state change
    useEffect(() => {
        if (selectedState) {
            fetchCities("India", selectedState);
            setValue("city", "");
        }
    }, [selectedState]);

    // -------------------------------
    // Fetch States
    // -------------------------------
    const fetchStates = async (countryName) => {
        setLoading((p) => ({ ...p, states: true }));
        try {
            const response = await axios.post(
                "https://countriesnow.space/api/v0.1/countries/states",
                { country: countryName }
            );

            if (response.data.data?.states) {
                const list = response.data.data.states
                    .map((s) => ({ name: s.name }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                setStates(list);
                setFilteredStates(list);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoading((p) => ({ ...p, states: false }));
        }
    };

    // -------------------------------
    // Fetch Cities for selected state
    // -------------------------------
    const fetchCities = async (countryName, stateName) => {
        setLoading((p) => ({ ...p, cities: true }));
        try {
            const response = await axios.post(
                "https://countriesnow.space/api/v0.1/countries/state/cities",
                { country: countryName, state: stateName }
            );

            if (response.data.data) {
                const list = response.data.data
                    .sort((a, b) => a.localeCompare(b))
                    .map((city) => ({ name: city }));

                setCities(list);
                setFilteredCities(list);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoading((p) => ({ ...p, cities: false }));
        }
    };

    return (
        <View style={styles.container}>

            {/* ----------------------- */}
            {/* STATE SEARCHABLE INPUT  */}
            {/* ----------------------- */}
            <Text style={styles.label}>State</Text>
            <Controller
                control={control}
                name="state"
                render={({ field: { value, onChange } }) => (
                    <View style={{ position: "relative" }}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type State..."
                            value={value}
                            onChangeText={(text) => {
                                onChange(text);

                                setShowStateDropdown(true);

                                console.log("Value", value);
                                console.log("text", text);
                                const filtered = states.filter((s) =>
                                    s.name.toLowerCase().includes(text.toLowerCase())
                                );
                                setFilteredStates(filtered);
                            }}
                            onFocus={() => {

                            }}
                        />

                        {loading.states && <ActivityIndicator style={styles.loader} />}

                        {showStateDropdown && filteredStates.length > 0 && (
                            <ScrollView style={styles.dropdown}>
                                {filteredStates.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            onChange(item.name);
                                            setState(item.name);
                                            setShowStateDropdown(false);
                                        }}
                                    >
                                        <Text>{item.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                )}
            />

            {/* ----------------------- */}
            {/* CITY SEARCHABLE INPUT   */}
            {/* ----------------------- */}
            <Text style={styles.label}>City</Text>
            <Controller
                control={control}
                name="city"
                render={({ field: { value, onChange } }) => (
                    <View style={{ position: "relative" }}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type City..."
                            value={value}
                            editable={!!selectedState}
                            onChangeText={(text) => {
                                onChange(text);
                                setShowCityDropdown(true);

                                const filtered = cities.filter((c) =>
                                    c.name.toLowerCase().includes(text.toLowerCase())
                                );
                                setFilteredCities(filtered);
                            }}
                            onFocus={() => {
                                if(stateTextChange !== selectedState) {
                                    console.log('Select State', stateTextChange);
                                    console.log('SelectedState', selectedState);
                                }
                            }}
                        />

                        {loading.cities && <ActivityIndicator style={styles.loader} />}

                        {showCityDropdown && filteredCities.length > 0 && (
                            <ScrollView style={styles.dropdown}>
                                {filteredCities.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            onChange(item.name);
                                            setShowCityDropdown(false);
                                        }}
                                    >
                                        <Text>{item.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#432727ff",
        height: height,
        width: width,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 6,
        marginTop: 20,
    },
    textInput: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderColor: "#ccc",
        borderWidth: 1,
    },
    loader: {
        position: "absolute",
        right: 15,
        top: 15,
    },
    dropdown: {
        position: "absolute",
        top: 52,
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 8,
        borderColor: "#ddd",
        borderWidth: 1,
        maxHeight: 180,
        zIndex: 10,
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
});

export default LocationFilteredDropDown;