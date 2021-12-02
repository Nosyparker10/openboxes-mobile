import React from 'react';
import {DispatchProps, Props} from './Types';
import {Container} from '../../data/container/Container';
import {
  FlatList,
  ListRenderItemInfo,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ContainerShipmentItem} from '../../data/container/ContainerShipmentItem';
import {fetchContainer, getContainer} from '../../redux/actions/lpn';
import {getShipmentPacking} from '../../redux/actions/packing';
import {connect} from 'react-redux';
import styles from './styles';
import Button from '../../components/Button';
import PrintModal from '../../components/PrintModal';
import showPopup from '../../components/Popup';

export interface State {
  container: Container | null;
  visible: boolean;
  containerDetails: any;
}

class LpnDetail extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      container: null,
      visible: false,
      containerDetails: null,
    };
  }

  getContainerDetails = (id: string) => {
    if (!id) {
      showPopup({
        message: 'id is empty',
        positiveButton: {text: 'Ok'},
      });
      return;
    }

    const actionCallback = (data: any) => {
      if (data?.error) {
        showPopup({
          title: data.errorMessage
              ? `Failed to load details with value = "${id}"`
              : null,
          message:
              data.errorMessage ?? `Failed to load details with value = "${id}"`,
          positiveButton: {
            text: 'Retry',
            callback: () => {
              this.props.getContainer(id, actionCallback);
            },
          },
          negativeButtonText: 'Cancel',
        });
      } else {
        const {id} = this.props.route.params;
        data.product = {id};
        this.setState({containerDetails: data, visible: true});
      }
    };
    this.props.getContainer(id, actionCallback);
  };
  handleClick = () => {
    const {id} = this.props.route.params;
    this.getContainerDetails(id);
  };
  closeModal = () => {
    this.setState({visible: false});
  };

  componentDidMount() {
    const {id} = this.props.route.params;
    this.fetchContainerDetail(id);
  }

  fetchContainerDetail = (id: string) => {
    const actionCallback = (data: any) => {
      const {shipmentNumber} = this.props.route.params;
      data.shipmentNumber = shipmentNumber;
      this.setState({
        container: data,
      });
    };
    this.props.fetchContainer(id, actionCallback);
  };

  onTapped = (shipmentItem: ListRenderItemInfo<ContainerShipmentItem>) => {
    this.props.navigation.navigate('Packing', {shipment: shipmentItem});
  };

  render() {
    return (
        <View style={styles.contentContainer}>
          <View style={styles.contentContainer}>
            <View style={styles.row}>
              <View style={styles.col50}>
                <Text style={styles.label}>Shipment Number</Text>
                <Text style={styles.value}>
                  {this.state.container?.shipmentNumber}
                </Text>
              </View>
              <View style={styles.col50}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{this.state.container?.name}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col50}>
                <Text style={styles.label}>Container Number</Text>
                <Text style={styles.value}>
                  {this.state.container?.containerNumber}
                </Text>
              </View>
              <View style={styles.col50}>
                <Text style={styles.label}>Container Type</Text>
                <Text style={styles.value}>
                  {this.state.container?.containerType?.name}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col50}>
                <Text style={styles.label}>Number of Items</Text>
                <Text style={styles.value}>
                  {this.state.container?.shipmentItems?.length}
                </Text>
              </View>
            </View>
            <FlatList
                data={this.state.container?.shipmentItems}
                renderItem={(
                    shipmentItem: ListRenderItemInfo<ContainerShipmentItem>,
                ) => (
                    <TouchableOpacity
                        style={styles.listItemContainer}
                        onPress={() => this.onTapped(shipmentItem)}>
                      <View style={styles.row}>
                        <View style={styles.col50}>
                          <Text style={styles.label}>Product Code</Text>
                          <Text style={styles.value}>
                            {shipmentItem.item?.inventoryItem?.product?.productCode}
                          </Text>
                        </View>
                        <View style={styles.col50}>
                          <Text style={styles.label}>Product</Text>
                          <Text style={styles.value}>
                            {shipmentItem.item?.inventoryItem?.product?.name}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.row}>
                        <View style={styles.col50}>
                          <Text style={styles.label}>Quantity</Text>
                          <Text style={styles.value}>
                            {shipmentItem.item.quantity}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
                style={styles.list}
            />
            <View style={styles.bottom}>
              <Button
                  title={'Print Barcode Label'}
                  onPress={this.handleClick}
                  disabled={false}
              />
            </View>
          </View>
          <PrintModal
              visible={this.state.visible}
              closeModal={this.closeModal}
              type={'containers'}
              product={this.state.containerDetails?.product}
              defaultBarcodeLabelUrl={
                this.state.containerDetails?.defaultBarcodeLabelUrl
              }
          />
        </View>
    );
  }
}

const mapDispatchToProps: DispatchProps = {
  fetchContainer,
  getShipmentPacking,
  getContainer,
};

export default connect(null, mapDispatchToProps)(LpnDetail);
