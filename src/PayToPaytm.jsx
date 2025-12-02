import React, { useState } from "react";
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import AllInOneSDKManager from 'paytmpayments-allinone-react-native';
import axios from "axios";

const { height, width } = Dimensions.get('window');

const PayToPaytm = () => {

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const userId = 12345;

    const [orderId, setOrderId] = useState('');
    const mid = "YOUR_MID_HERE";  // ❗ IMPORTANT: replace with your actual MID
    const [txnToken, setTxnToken] = useState("");
    const isStaging = true;
    const appInvokeRestricted = false;
    const urlScheme = "";

    // -------------------------------
    // 1️⃣ Generate txnToken + orderId
    // -------------------------------
    const getTxnToken = async () => {
        try {
            const response = await axios.post(
                "http://10.0.2.2:8080/payment/start",
                { userId: userId, amount: amount }
            );

            const data = response.data;

            setOrderId(data.orderId);
            setTxnToken(data.txnToken);

            const callbackUrl =
                `https://securestage.paytmpayments.com/theia/paytmCallback?ORDER_ID=${data.orderId}`;

            startPaytmPayment(data.orderId, data.txnToken, callbackUrl);

        } catch (error) {
            console.log("Error fetching token:", error);
            Alert.alert("Error", "Unable to generate transaction token.");
        }
    };

    // -------------------------------
    // 2️⃣ Start Payment via SDK
    // -------------------------------
    const startPaytmPayment = (orderId, txnToken, callbackUrl) => {
        AllInOneSDKManager.startTransaction(
            orderId,
            mid,
            txnToken,
            amount,
            callbackUrl,
            isStaging,
            appInvokeRestricted,
            urlScheme
        )
            .then(async (result) => {
                console.log("Payment Result:", result);

                // call validate payment if user didn't cancel
                if (result.STATUS !== "TXN_CANCELLED") {
                    await validatePayment(orderId);
                } else {
                    Alert.alert("Payment Cancelled", "You cancelled the payment.");
                }
            })
            .catch((err) => {
                console.log("Payment Error:", err);
                Alert.alert("Payment Failed", "Something went wrong with payment.");
            });
    };

    // -------------------------------
    // 3️⃣ Validate Payment (call backend)
    // -------------------------------
    const validatePayment = async (orderId) => {
        try {
            const response = await axios.post(
                `http://10.0.2.2:8080/payment/validatePayment/${orderId}`
            );

            const apiResponse = response.data;

            if (apiResponse.success) {
                Alert.alert("Payment Successful", "Your payment was received!");
            } else {
                Alert.alert("Payment Failed", "Payment could not be completed.");
            }

        } catch (error) {
            console.log("Validation Error:", error);
            Alert.alert("Validation Failed", "Unable to verify payment.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}> Paytm Payment Gateway </Text>

            <TextInput
                style={styles.textInput}
                placeholder="Enter Name"
                value={name}
                onChangeText={(text) => setName(text)} />

            <TextInput
                style={styles.textInput}
                placeholder="Enter Amount"
                keyboardType="numeric"
                value={amount}
                onChangeText={(text) => setAmount(text)} />

            <TouchableOpacity style={styles.button} onPress={getTxnToken}>
                <Text style={styles.buttonTxt}> Initiate Payment </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#efefef',
        height: height,
        width: width
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#000',
    },
    textInput: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        fontSize: 16,
        height: 50,
        marginVertical: 5
    },
    button: {
        width: width * 0.8,
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#c61919ff',
        marginVertical: 5
    },
    buttonTxt: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
});

export default PayToPaytm;