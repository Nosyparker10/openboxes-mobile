import React, {useEffect, useState} from 'react';
import {DispatchProps} from './types';
import styles from './styles';
import {ScrollView, Text, TextInput, View} from 'react-native';
import {pickListVMMapper} from './PickListVMMapper';
import {showScreenLoading, hideScreenLoading} from '../../redux/actions/main';
import {connect, useDispatch} from 'react-redux';
import showPopup from "../../components/Popup";
import {getPickListItemAction, submitPickListItem} from '../../redux/actions/orders';
import {
    searchProductByCodeAction, searchProductGloballyAction
} from '../../redux/actions/products';
import {searchLocationByLocationNumber} from "../../redux/actions/locations";
import {useRoute} from "@react-navigation/native";
import Button from "../../components/Button";
import useEventListener from "../../hooks/useEventListener";
import InputBox from "../../components/InputBox";


const PickOrderItem = () => {
    const route = useRoute();
    const dispatch = useDispatch();
    const barcodeData = useEventListener();
    const [state, setState] = useState<any>({
        error: "",
        pickListItem: null,
        order: null,
        productSearchQuery: "",
        binLocationSearchQuery: "",
        quantityPicked: "0",
        product: null,
        productCode: "",
        binLocation: null,
    })
    const vm = pickListVMMapper(route.params);
    console.log("VM", vm)
    useEffect(() => {
        getPickListItem()

    }, [])
    useEffect(() => {
        if (barcodeData && Object.keys(barcodeData).length !== 0) {
            onBarCodeScanned(barcodeData.data)
        }
    }, [barcodeData])

    const showErrorPopup = (data: any, query: any, actionCallback: any, searchBarcode: any) => {
        showPopup({
            title: data.error.message
                ? `Failed to load search results with value = "${query}"`
                : null,
            message:
                data.error.message ??
                `Failed to load search results with value = "${query}"`,
            positiveButton: {
                text: 'Retry',
                callback: () => {
                    dispatch(searchBarcode(query, actionCallback));
                },
            },
            negativeButtonText: 'Cancel',
        });
    }
    const onBarCodeScanned = (query: string) => {
        // handleBarcodeScan(barcodeNo);
        if (!query) {
            showPopup({
                message: 'Search query is empty',
                positiveButton: {text: 'Ok'},
            });
            return;
        }
        if (query.includes("LOG-XXX")) {
            const actionCallback = (data: any) => {
                if (data?.error) {
                    showErrorPopup(data, query, actionCallback, searchProductGloballyAction)
                } else {
                    console.log(data)
                    if (data.length == 0) {
                        showPopup({
                            message: `No search results found for product name "${query}"`,
                            positiveButton: {text: 'Ok'},
                        });
                    } else {
                        if (data && Object.keys(data).length !== 0) {
                            if (state.pickListItem?.productCode !== data.data[0].productCode) {
                                showPopup({
                                    message: `You have scanned a wrong product barcode "${query}"`,
                                    positiveButton: {text: 'Ok'},
                                });
                            } else {
                                state.quantityPicked = (parseInt(state.quantityPicked, 10) + 1).toString();
                                state.product = data.data[0]
                                state.productSearchQuery = ""

                            }
                            setState({...state})
                        }
                    }
                    dispatch(hideScreenLoading());
                    ;
                }
            };
            dispatch(searchProductGloballyAction(query, actionCallback));
        } else {
            const actionBinLocationCallback = (data: any) => {
                if (data?.error) {
                    showErrorPopup(data, query, actionBinLocationCallback, searchLocationByLocationNumber)
                } else {
                    if (data.length == 0) {
                        showPopup({
                            message: `No search results found for Location name "${query}"`,
                            positiveButton: {text: 'Ok'},
                        });
                    } else {
                        console.log(data)
                        if (data && Object.keys(data).length !== 0) {
                            if (state.binLocation === "" || state.binLocation === data.name) {
                                state.binLocation = data;
                                state.binLocationSearchQuery = "";
                            }
                            setState({...state})
                        } else {
                            showPopup({
                                message: `You have scanned a wrong bin location barcode "${query}"`,
                                positiveButton: {text: 'Ok'},
                            });
                        }
                    }
                    dispatch(hideScreenLoading());
                }
            };
            dispatch(searchLocationByLocationNumber(query, actionBinLocationCallback));
        }
    };

    const getPickListItem = async () => {
        try {
            // showProgressBar("Fetching PickList Item")
            const {pickListItem}: any = route.params;
            const actionCallback = (data: any) => {
                console.log("getPickListItem", data)
                if (data?.length == 0) {
                    setState({
                        ...state,
                        pickListItem: data,
                        error: 'No Picklist found',
                    });
                } else {
                    setState({
                        ...state,
                        pickListItem: data,
                        error: "",
                    });
                }
            };
            console.debug("pickListItem?.id::")
            console.debug(pickListItem?.id)
            dispatch(getPickListItemAction(pickListItem?.id, actionCallback));
        } catch (e) {

        }
    }

    const formSubmit = () => {
        try {
            let errorTitle = ""
            let errorMessage = ""
            if (state.product == null) {
                errorTitle = "Product Code!"
                errorMessage = "Please scan Product Code."
            } else if (state.quantityPicked == null || state.quantityPicked == "") {
                errorTitle = "Quantity Pick!"
                errorMessage = "Please pick some quantity."
            } else if (vm.picklistItems.quantityPicked === state.quantityPicked) {
                errorTitle = "Quantity Pick!"
                errorMessage = "Quantity picked is not valid"
            }
            if (errorTitle != "") {
                showPopup({
                    title: errorTitle,
                    message: errorMessage,
                    // positiveButtonText: "Retry",
                    negativeButtonText: "Cancel"
                })
                return Promise.resolve(null)
            }
            const requestBody = {
                "product.id": state.product?.id,
                "productCode": state.product?.productCode,
                "inventoryItem.id": null,
                "binLocation.id": state.binLocation ? state.binLocation?.id : null,
                "binLocation.locationNumber": state.binLocation ? state.binLocation?.locationNumber : state.binLocationSearchQuery,
                "quantityPicked": state.quantityPicked,
                "picker.id": null,
                "datePicked": null,
                "reasonCode": null,
                "comment": null,
                "forceUpdate": false
            }
            const actionCallback = (data: any) => {
                console.debug("data after submit")
                console.debug(data)
                if (data?.length == 0) {
                    // setState({
                    //     pickListItem: data,
                    //     error: 'No Picklist found',
                    // });
                } else {
                    // setState({
                    //     pickListItem: data,
                    //     error: null,
                    // });
                }
            }
            submitPickListItem(state.pickListItem?.id as string, requestBody, actionCallback);
        } catch (e) {
            const title = e.message ? "Failed submit item" : null
            const message = e.message ?? "Failed submit item"
            showPopup({
                title: title,
                message: message,
                // positiveButtonText: "Retry",
                negativeButtonText: "Cancel"
            })
            return Promise.resolve(null)
        } finally {
        }
    }

    const productSearchQueryChange = (query: string) => {
        setState({
            ...state,
            productSearchQuery: query
        })
        onProductBarCodeSearchQuerySubmitted()
    }

    const onProductBarCodeSearchQuerySubmitted = () => {

        if (!state.productSearchQuery) {
            showPopup({
                message: "Search query is empty",
                positiveButton: {
                    text: 'Ok'
                }
            })
            return
        }


        const actionCallback = (data: any) => {
            console.debug("product searched completed")
            console.debug(data.data.length)
            if (!data || data.data.length == 0) {
                showPopup({
                    message: "Product not found with ProductCode:" + state.productSearchQuery,
                    positiveButton: {
                        text: 'Ok'
                    }
                })
                return
            } else if (data.data.length == 1) {
                console.debug("data.length")
                console.debug(data.length)
                setState({
                    ...state,
                    product: data.data[0],
                    quantityPicked: (parseInt(state.quantityPicked, 10) + 1).toString(),
                    productSearchQuery: ""
                })
            }
        }
        dispatch(searchProductByCodeAction(state.productSearchQuery, actionCallback));


        /*let searchedProducts = await searchProductCodeFromApi(state.productSearchQuery)

        */
    }

    const onBinLocationBarCodeSearchQuerySubmitted = () => {

        if (!state.binLocationSearchQuery) {
            showPopup({
                message: "Search query is empty",
                positiveButton: {
                    text: 'Ok'
                }
            })
            return
        }

        const actionCallback = (location: any) => {
            if (!location || location.error) {
                showPopup({
                    message: "Bin Location not found with LocationNumber:" + state.binLocationSearchQuery,
                    positiveButton: {
                        text: 'Ok'
                    }
                })
                return
            } else if (location) {
                setState({
                    ...state,
                    binLocation: location,
                    binLocationSearchQuery: ""
                })
            }
        }
        dispatch(searchLocationByLocationNumber(state.binLocationSearchQuery, actionCallback))
    }

    const binLocationSearchQueryChange = (query: string) => {
        setState({
            ...state,
            binLocationSearchQuery: query
        })
        onBinLocationBarCodeSearchQuerySubmitted()
    }

    const quantityPickedChange = (query: string) => {
        setState({
            ...state,
            quantityPicked: query
        })
    }

    const onChangeProduct = (text: string) => {
        state.product.productCode = text
        setState({...state})
    }

    const onChangeBin = (text: string) => {
        state.binLocation.name = text
        setState({...state})
    }

    return (
        <ScrollView>

            {/*<Header
                        title={vm.header}
                        backButtonVisible={true}
                        onBackButtonPress={exit}
                    />*/}
            <View style={styles.contentContainer}>
                <View style={styles.topRow}>
                    <Text style={styles.name}>{state.pickListItem?.["product.name"]}</Text>
                </View>
                <View style={styles.row}>
                    <View style={styles.col40}>
                        <Text style={styles.value}>Order Number</Text>
                    </View>
                    <View style={styles.col60}>
                        <Text style={styles.value}>{vm.order.identifier}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.col40}>
                        <Text style={styles.value}>Destination</Text>
                    </View>
                    <View style={styles.col60}>
                        <Text style={styles.value}>{vm.order.destination?.name}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.col40}>
                        <Text style={styles.value}>Product Code</Text>
                    </View>
                    <View style={styles.col60}>
                        <Text style={styles.value}>{state.pickListItem?.productCode}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.col40}>
                        <Text style={styles.value}>Product Name</Text>
                    </View>
                    <View style={styles.col60}>
                        <Text style={styles.value}>{state.pickListItem?.["product.name"]}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.col40}>
                        <Text style={styles.value}>Unit of Measure</Text>
                    </View>
                    <View style={styles.col60}>
                        <Text style={styles.value}>{state.pickListItem?.unitOfMeasure}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.col40}>
                        <Text style={styles.value}>Lot Number</Text>
                    </View>
                    <View style={styles.col60}>
                        <Text style={styles.value}>{state.pickListItem?.lotNumber}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.col40}>
                        <Text style={styles.value}>Expiration</Text>
                    </View>
                    <View style={styles.col60}>
                        <Text style={styles.value}>{state.pickListItem?.expirationDate}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.col40}>
                        <Text style={styles.value}>Bin Location</Text>
                    </View>
                    <View style={styles.col60}>
                        <Text style={styles.value}>{state.pickListItem?.["binLocation.name"]}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.col40}>
                        <Text style={styles.value}>Qty Requested</Text>
                    </View>
                    <View style={styles.col60}>
                        <Text style={styles.value}>{state.pickListItem?.quantityRequested}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.col40}>
                        <Text style={styles.value}>Qty Remaining</Text>
                    </View>
                    <View style={styles.col60}>
                        <Text style={styles.value}>{state.pickListItem?.quantityRemaining}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.col40}>
                        <Text style={styles.value}>Qty Picked</Text>
                    </View>
                    <View style={styles.col60}>
                        <Text style={styles.value}>{state.pickListItem?.quantityPicked}</Text>
                    </View>
                </View>


                <View style={styles.emptyRow}>

                </View>
                {/*

                <View style={styles.topRow}>
                    <View style={styles.col40}>
                        <Text style={styles.value}>Bin Location</Text>
                    </View>
                    <View style={styles.col60}>
                        <TextInput
                            placeholder="Scan Bin Location"
                            onChangeText={binLocationSearchQueryChange}
                            value={state.binLocationSearchQuery}
                            style={styles.value}
                            onSubmitEditing={onBinLocationBarCodeSearchQuerySubmitted}
                        />
                        {state.binLocation != null ? <Text
                            style={styles.info}>{state.binLocation?.locationNumber}-{state.binLocation?.name}</Text> : null}
                    </View>
                    <View style={styles.width100}>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.col40}>
                        <Text style={styles.value}>Product Code</Text>
                    </View>
                    <View style={styles.col60}>
                        <TextInput
                            placeholder="Scan Product"
                            onChangeText={productSearchQueryChange}
                            value={state.productSearchQuery}
                            style={styles.value}
                            onSubmitEditing={onProductBarCodeSearchQuerySubmitted}
                        />
                        {state.product != null ? <Text
                            style={styles.info}>{state.product?.productCode}-{state.product?.description}</Text> : null}
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.col40}>
                        <Text style={styles.value}>Quantity Picked</Text>
                    </View>
                    <View style={styles.col60}>
                        <TextInput
                            placeholder="Enter Picked Quantity"
                            onChangeText={quantityPickedChange}
                            value={state.quantityPicked}
                            style={styles.value}
                            // onSubmitEditing={onBarCodeSearchQuerySubmitted}
                        />
                    </View>
                </View>*/}
                <View style={styles.from}>
                    <InputBox
                        value={state.product?.productCode}
                        disabled={true}
                        onEndEdit={productSearchQueryChange}
                        onChange={onChangeProduct}
                        label={'Product Code'}/>
                    <InputBox
                        value={state.binLocation?.name}
                        label={'From'}
                        disabled={true}
                        onEndEdit={binLocationSearchQueryChange}
                        onChange={onChangeBin}
                    />
                    <InputBox
                        label={'Quantity to transfer'}
                        value={state.quantityPicked}
                        onChange={quantityPickedChange}
                        disabled={true}
                        onEndEdit={quantityPickedChange}
                        keyboard={"number-pad"}
                        showSelect={true}/>
                </View>
                {/*<View style={styles.row}>
                            <View style={styles.col40}>
                                <Text style={styles.label}>Qty Available</Text>
                                <Text style={styles.value}>{state.pickListItem?.quantityAvailable}</Text>
                            </View>
                            <View style={styles.col60}>
                                <Text style={styles.label}>Qty Picked</Text>
                                <TextInput style={styles.textInput} placeholder="Qty Picked"
                                           value={state.pickListItem?.quantityPicked.toString()}/>
                            </View>
                        </View>*/}
                <Button
                    title="Submit"
                    style={{
                        marginTop: 8,
                    }}
                    onPress={formSubmit}
                />
            </View>

        </ScrollView>
    );
}

const mapDispatchToProps: DispatchProps = {
    showScreenLoading,
    hideScreenLoading,
    getPickListItemAction,
    submitPickListItem,
    searchProductByCodeAction,
    searchLocationByLocationNumber,
};
export default connect(null, mapDispatchToProps)(PickOrderItem);