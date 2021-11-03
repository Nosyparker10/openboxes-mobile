import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styles from './styles';
import {Image, ScrollView, Text, View} from 'react-native';
import InputBox from '../../components/InputBox';
import Button from "../../components/Button";
import showPopup from "../../components/Popup";
import {useNavigation, useRoute} from "@react-navigation/native";
import Radio from "../../components/Radio";
import {submitPartialReceiving} from "../../redux/actions/inboundorder";
import SelectDropdown from "react-native-select-dropdown";
import {getInternalLocations} from "../../redux/actions/locations";
import {RootState} from "../../redux/reducers";


const InboundReceiveDetail = () => {
    const dispatch = useDispatch();
    const route = useRoute();
    const {shipmentItem, shipmentData, shipmentId}: any = route.params
    const [cancelRemaining, setCancelRemaining] = useState(false)
    const navigation = useNavigation();
    const location = useSelector((state: RootState) => state.mainReducer.currentLocation)
    console.log("AAAAA", shipmentItem)
    const [state, setState] = useState<any>({
        comments: "",
        internalLocation: [],
        receiveLocation: shipmentItem["binLocation.name"],
        deliveryDate: shipmentData.expectedDeliveryDate,
        quantityToReceive: shipmentItem.quantityRemaining.toString(),
        error: null,
    })
    useEffect(() => {
        getInternalLocation(location.id)
    }, [shipmentItem])


    const onReceive = () => {
        let errorTitle = ""
        let errorMessage = ""
        if (state.quantityToReceive == null || state.quantityToReceive == "") {
            errorTitle = "Quantity!"
            errorMessage = "Please fill the Quantity to Receive"
        } else if (parseInt(state.quantityToReceive, 10) > parseInt(state.quantityRemaining, 10)) {
            errorTitle = "Quantity!"
            errorMessage = "Quantity to Receive is greater than quantity remaining"
        }
        if (errorTitle != "") {
            showPopup({
                title: errorTitle,
                message: errorMessage,
                negativeButtonText: "Cancel"
            })
            return Promise.resolve(null)
        }
        const request = {
            "receiptId": "",
            "receiptStatus": "PENDING",
            "shipmentId": shipmentId,
            "containers": [
                {
                    "container.id": shipmentItem["container.id"],
                    "shipmentItems": [
                        {
                            "receiptItemId": "",
                            "shipmentItemId": shipmentItem.shipmentItemId,
                            "container.id": shipmentItem["container.id"],
                            "product.id": shipmentItem["product.id"],
                            "binLocation.id": shipmentItem["binLocation.id"],
                            "recipient": "",
                            "quantityReceiving": state.quantityToReceive,
                            "cancelRemaining": cancelRemaining,
                            "quantityOnHand": "",
                            "comment": state.comments
                        }
                    ]
                }
            ]
        }
        submitReceiving(shipmentId, request)
    }

    const onChangeComment = (text: string) => {
        setState({...state, comments: text})
    }

    const onChangeDate = (text: string) => {
        setState({...state, deliveryDate: text})
    }
    const onChangeQuantity = (text: string) => {
        setState({...state, quantityToReceive: text})
    }
    const submitReceiving = (id: string, requestBody: any) => {
        const callback = (data: any) => {
            if (data?.error) {
                showPopup({
                    title: data.error.message
                        ? `In Bound order details`
                        : null,
                    message:
                        data.error.message ??
                        `Failed to load Inbound order details value ${id}`,
                    positiveButton: {
                        text: 'Retry',
                        callback: () => {
                            dispatch(submitPartialReceiving(id, requestBody, callback));
                        },
                    },
                    negativeButtonText: 'Cancel',
                });
            } else {
                if (data && Object.keys(data).length !== 0) {
                    if (data.receiptId !== "" && data.receipt != "") {
                        const receiptStatus = {
                            "receiptStatus": "COMPLETED"
                        }
                        dispatch(submitPartialReceiving(id, receiptStatus, onComplete));
                    }
                }
                setState({...state})
            }
        }
        dispatch(submitPartialReceiving(id, requestBody, callback));
    }

    const onComplete = (data: any) => {
        if (data?.error) {
            showPopup({
                title: data.error.message
                    ? `In Bound order details`
                    : null,
                message:
                    data.error.message ??
                    `Failed to load Inbound order details`,
                positiveButton: {
                    text: 'Ok',
                }
            });
        } else {
            if (data && Object.keys(data).length !== 0) {
                navigation.goBack();
            }
        }
    }
    const RenderData = ({title, subText}: any): JSX.Element => {
        return (
            <View style={styles.columnItem}>
                <Text style={styles.label}>{title}</Text>
                <Text style={styles.value}>{subText}</Text>
            </View>
        )
    }


    const RenderShipmentItem = (): JSX.Element => {
        return (<View
            style={styles.itemView}>
            <View style={styles.rowItem}>
                <RenderData title={"Shipment number"} subText={shipmentData?.shipmentData}/>
                <RenderData title={"Product Code"} subText={shipmentItem["product.productCode"]}/>
            </View>
            <View style={styles.rowItem}>
                <RenderData title={"Lot Number"} subText={shipmentItem.lotNumber}/>
            </View>
            <View style={styles.rowItem}>
                <RenderData title={"Quantity Shipped"} subText={shipmentItem.quantityShipped}/>
                <RenderData title={"Quantity Remaining"} subText={shipmentItem.quantityReceived}/>
            </View>
        </View>);
    }
    const renderIcon = () => {
        return (
            <Image style={styles.arrowDownIcon} source={require('../../assets/images/arrow-down.png')}/>
        )
    }

    const getInternalLocation = (id: string = "") => {
        const callback = (data: any) => {
            if (data?.error) {
                showPopup({
                    title: data.error.message
                        ? `internal location details`
                        : null,
                    message:
                        data.error.message ??
                        `Failed to load internal location value ${id}`,
                    positiveButton: {
                        text: 'Retry',
                        callback: () => {
                            dispatch(getInternalLocations(id, callback));
                        },
                    },
                    negativeButtonText: 'Cancel',
                });
            } else {
                console.log(data)

                if (data && Object.keys(data).length !== 0) {
                    let locationList: string[] = [];
                    console.log(data)
                    data.data.map((item: any) => {
                        locationList.push(item.name)
                    })
                    state.internalLocation = locationList
                }
                setState({...state})
            }
        }
        dispatch(getInternalLocations(id, callback));
    }
    return (
        <ScrollView style={styles.container}>
            <RenderShipmentItem/>
            <View style={styles.from}>
                <Text style={styles.value}>{"Receiving Location"}</Text>
                <SelectDropdown
                    data={state.internalLocation}
                    onSelect={(selectedItem, index) => {
                        console.log(selectedItem, index)
                        state.receiveLocation = selectedItem;
                        setState({...state})
                    }}
                    defaultValueByIndex={0}
                    renderDropdownIcon={renderIcon}
                    buttonStyle={styles.select}
                    buttonTextAfterSelection={(selectedItem, index) => selectedItem}
                    rowTextForSelection={(item, index) => item}
                />
                <InputBox
                    label={'Quantity Received'}
                    value={state.quantityToReceive}
                    onChange={onChangeQuantity}
                    disabled={true}
                    keyboard={"number-pad"}/>
                <InputBox
                    label={'Date Delivered'}
                    value={state.deliveryDate}
                    onChange={onChangeDate}
                    disabled={true}
                    keyboard={"number-pad"}/>
                <InputBox
                    value={state.comments}
                    onChange={onChangeComment}
                    disabled={true}
                    editable={true}
                    label={'Comments'}/>
                <Radio
                    title={"Cancel Remaining"}
                    checked={cancelRemaining}
                />
            </View>
            <View style={styles.bottom}>
                <Button
                    title="Receive"
                    onPress={onReceive}
                />
            </View>
        </ScrollView>
    );
}


export default InboundReceiveDetail;