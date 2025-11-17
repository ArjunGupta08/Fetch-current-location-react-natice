import Geolocation from "@react-native-community/geolocation";
import React, { useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";


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
        const address = await reverseGeocode(lat, long);
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
        <View style={style.container}>
            <Text style={style.addressTxt}> {error} </Text>
            <TouchableOpacity style={style.button} onPress={fetchLocation}>
                <Text style={style.buttonTxt}>Fetch coords</Text>
            </TouchableOpacity>
            <Text style={style.addressTxt}> {city} , {state}, {country}, {pincode}, {display}. </Text>
        </View>
    );
};

const style = StyleSheet.create({
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
        fontSize:16,
        color: '#fff',
        width: width*0.8,
        fontWeight: 700,
        margin:20
    }
});

export default GetCurrentLocation;