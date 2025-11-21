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

import axios from "axios";

const { height, width } = Dimensions.get("window");

const LocationFilteredDropDown = () => {

    // --- FORM STATES ----
    const [stateInput, setStateInput] = useState("");
    const [cityInput, setCityInput] = useState("");

    // --- SELECTED VALUES ---
    const [selectedState, setSelectedState] = useState("");

    // --- API DATA ---
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // --- FILTERED LISTS ---
    const [filteredStates, setFilteredStates] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);

    // --- DROPDOWN VISIBILITY ---
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    // --- LOADERS ---
    const [loading, setLoading] = useState({
        states: false,
        cities: false,
    });

    // -------------------------
    // FETCH STATES
    // -------------------------
    const fetchStates = async () => {
        setLoading(p => ({ ...p, states: true }));

        try {
            const response = await axios.post(
                "https://countriesnow.space/api/v0.1/countries/states",
                { country: "India" }
            );

            const list = response.data.data.states
                .map(s => ({ name: s.name }))
                .sort((a, b) => a.name.localeCompare(b.name));

            setStates(list);
            setFilteredStates(list);
        } catch (error) {
            console.log("Error fetching states:", error);
        } finally {
            setLoading(p => ({ ...p, states: false }));
        }
    };

    // -------------------------
    // FETCH CITIES
    // -------------------------
    const fetchCities = async (stateName) => {
        setLoading(p => ({ ...p, cities: true }));

        try {
            const response = await axios.post(
                "https://countriesnow.space/api/v0.1/countries/state/cities",
                { country: "India", state: stateName }
            );

            const list = response.data.data
                .sort((a, b) => a.localeCompare(b))
                .map(city => ({ name: city }));

            setCities(list);
            setFilteredCities(list);
        } catch (error) {
            console.log("Error fetching cities:", error);
        } finally {
            setLoading(p => ({ ...p, cities: false }));
        }
    };

    // Fetch states on first load
    useEffect(() => {
        fetchStates();
    }, []);

    // Fetch cities when a state is selected
    useEffect(() => {
        if (selectedState) {
            fetchCities(selectedState);
            setCityInput(""); // reset city field
        }
    }, [selectedState]);

    return (
        <View style={styles.container}>
            
            {/* ----------------------- */}
            {/* STATE INPUT             */}
            {/* ----------------------- */}
            <Text style={styles.label}>State</Text>

            <View style={{ position: "relative" }}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Type State..."
                    value={stateInput}
                    onChangeText={(text) => {
                        setStateInput(text);

                        if (text.length > 0) {
                            setShowStateDropdown(true);
                            const filtered = states.filter(s =>
                                s.name.toLowerCase().includes(text.toLowerCase())
                            );
                            setFilteredStates(filtered);
                        } else {
                            setShowStateDropdown(false);
                        }
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
                                    setStateInput(item.name);
                                    setSelectedState(item.name);
                                    setShowStateDropdown(false);
                                }}
                            >
                                <Text>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>


            {/* ----------------------- */}
            {/* CITY INPUT              */}
            {/* ----------------------- */}
            <Text style={styles.label}>City</Text>

            <View style={{ position: "relative" }}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Type City..."
                    value={cityInput}
                    editable={!!selectedState}
                    onChangeText={(text) => {
                        setCityInput(text);

                        // Edge condition: User must type 1st char
                        if (text.length === 0) {
                            setShowCityDropdown(false);
                            return;
                        }

                        // Edge condition: State input must match selectedState
                        if (stateInput !== selectedState) {
                            console.error("ERROR: Selected state and typed state do NOT match!");
                            setShowCityDropdown(false);
                            return;
                        }

                        setShowCityDropdown(true);
                        const filtered = cities.filter(c =>
                            c.name.toLowerCase().includes(text.toLowerCase())
                        );
                        setFilteredCities(filtered);
                    }}
                    onFocus={() => {
                        if (stateInput !== selectedState) {
                            console.error("ERROR: You must choose a valid state before selecting city!");
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
                                    setCityInput(item.name);
                                    setShowCityDropdown(false);
                                }}
                            >
                                <Text>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#432727ff",
        height,
        width,
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