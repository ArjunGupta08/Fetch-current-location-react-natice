import React, { useState } from "react";
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import AllInOneSDKManager from 'paytmpayments-allinone-react-native';
import axios from "axios";

const { height, width } = Dimensions.get('window');

const PayToPaytm = () => {

    const [name, setName] = useState("");
    const [inputAmount, setAmount] = useState("");
    const userId = "userId_01";

    // const [orderId, setOrderId] = useState('ORDER_1767335561613');
    // const [txnToken, setTxnToken] = useState("d9b3b8f1bb354cfc8a0396dc1b1d655d1767335562264");

    const mid = "ylBDXK93662672367348";  // ❗ IMPORTANT: replace with your actual MID
    const isStaging = true;
    const appInvokeRestricted = false;
    const urlScheme = "";

    // -------------------------------
    // 1️⃣ Generate txnToken + orderId
    // -------------------------------
    const getTxnToken = async () => {
        try {
            console.log("getTxnToken called");
            const response = await axios.post(
                "https://api.milkjatt.com/auth/initiatePayments/paytm",
                { amount: inputAmount, userId: userId }
            );

            const { orderId, txnToken, amount } = response.data;

            // setOrderId();
            // setTxnToken("d9b3b8f1bb354cfc8a0396dc1b1d655d1767335562264");

            // const callbackUrl =
            //     `https://securestage.paytmpayments.com/theia/paytmCallback?ORDER_ID=${orderId}`;
            const callbackUrl = "https://api.milkjatt.com/auth/paytm/callback";
            startPaytmPayment(orderId, txnToken, callbackUrl);

        } catch (error) {
            console.log("Error fetching token:", error);
            Alert.alert("Error", "Unable to generate transaction token.");
        }
    };

    // -------------------------------
    // 2️⃣ Start Payment via SDK
    // -------------------------------
    const startPaytmPayment = (orderId, txnToken, callbackUrl) => {
        console.log("amount: ", amount);
        console.log("OrderId: ", orderId);
        console.log("txnToken: ", txnToken);

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
                    // await validatePayment(orderId);
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
                value={inputAmount}
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