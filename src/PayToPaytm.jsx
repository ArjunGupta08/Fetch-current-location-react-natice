import React, { useState } from "react";
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AllInOneSDKManager from 'paytmpayments-allinone-react-native';
import axios from "axios";
const { height, width } = Dimensions.get('window');

const PayToPaytm = () => {

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");

    const [orderId, setOrderId] = useState('');
    const mid = 911;
    const [txnToken, setTxnToken] = useState("");
    const isStaging = true;
    const appInvokeRestricted = false;
    const urlScheme = "";

    const getTxnToken = async () => {
        try {
            const response = await axios.post(
                "http://10.0.2.2:8080/payment/start",
                { amount }
            );

            const data = response.data;

            setOrderId(data.orderId);
            setTxnToken(data.txnToken);

            //     Staging Environment: https://securestage.paytmpayments.com/theia/paytmCallback?ORDER_ID=<order_id>
            //     Production Environment: https://secure.paytmpayments.com/theia/paytmCallback?ORDER_ID=<order_id> 
            const callbackUrl =
                `https://securestage.paytmpayments.com/theia/paytmCallback?ORDER_ID=${data.orderId}`;

            startPaytmPayment(data.orderId, data.txnToken, callbackUrl);

        } catch (error) {
            console.log("Error fetching token:", error);
        }
    };

    const startPaytmPayment = (orderId, txnToken, callbackUrl) => {
        AllInOneSDKManager.startTransaction(
            orderId,
            mid,             // MUST be your real MID
            txnToken,
            amount,
            callbackUrl,
            isStaging,            // staging
            appInvokeRestricted,           // allow app invoke
            urlScheme               // scheme
        )
            .then((result) => {
                console.log("Payment Result:", result);
            })
            .catch((err) => {
                console.log("Payment Error:", err);
            });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}> Paytm Payment Gateway {amount}</Text>

            <TextInput
                style={styles.textInput}
                placeholder="Enter Name"
                value={name}
                onChangeText={(text) => setName(text)} />
            <TextInput
                style={styles.textInput}
                placeholder="Enter Amount"
                value={amount}
                onChangeText={(text) => setAmount(text)} />

            <TouchableOpacity style={styles.button} onPress={getTxnToken}>
                <Text style={styles.buttonTxt}> Initiat Order </Text>
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