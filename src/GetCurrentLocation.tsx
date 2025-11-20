import Geolocation from "@react-native-community/geolocation";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from 'react-hook-form';
import axios from "axios";

const { height, width } = Dimensions.get('window');


const GetCurrentLocation = () => {

    const [error, setError] = useState("");

    const [lat, setLat] = useState(0);
    const [long, setLong] = useState(0);

    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [pincode, setPincode] = useState('');
    const [display, setDisplay] = useState('');

    const fetchLocation = async () => {
        // Add logic to get location here.
        Geolocation.getCurrentPosition(
            pos => {
                console.log(pos);
                setLat(pos.coords.latitude);
                setLong(pos.coords.longitude);
                console.log("Lat: ", lat);
                console.log("Long: ", long);
                setError(`lat :  ${lat}, long: ${long}`);
            },
            err => console.log(err),
            { enableHighAccuracy: true }
        );
        await reverseGeocode(lat, long);
        // console.log("Address: ", address);    
    };

    const reverseGeocode = async (lat: any, lon: any) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            );

            const data = await response.json();
            console.log("Address: ", data.address);

            setCity(data.address.city);
            setState(data.address.state);
            setCountry(data.address.country);
            setPincode(data.address.postcode);
            setDisplay(data.address.country_code);

        } catch (error) {
            console.log("Reverse Geocode Error: ", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.addressTxt}> {error} </Text>
            <TouchableOpacity style={styles.button} onPress={fetchLocation}>
                <Text style={styles.buttonTxt}>Fetch coords</Text>
            </TouchableOpacity>
            <Text style={styles.addressTxt}> {city} , {state}, {country}, {pincode}, {display}. </Text>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#432727ff',
        height: height,
        width: width
    },
    button: {
        width: width * 0.8,
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#c61919ff'
    },
    buttonTxt: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
    addressTxt: {
        fontSize: 16,
        color: '#fff',
        width: width * 0.8,
        fontWeight: 700,
        margin: 20
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
    }
});

export default GetCurrentLocation;