/* eslint-disable react-native/no-inline-styles */
/* eslint-disable complexity */
import * as React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { Menu, Provider } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/actions/auth';

const OptionMenu = ({ route, navigation }: any) => {
  const dispatch = useDispatch();
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const handleLogout = () => dispatch(logout());
  return (
    <Provider>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          alignContent: 'flex-start'
        }}
      >
        <Image
          source={require('../assets/images/logo.png')}
          style={{
            resizeMode: 'stretch',
            width: 40,
            height: 30,
            marginTop: 10,
            marginEnd:
              route.name !== 'Login' && route.name !== 'Settings' ? 0 : 30
          }}
        />
        {route.name !== 'Login' && route.name !== 'Settings' ? (
          <Menu
            style={{
              width: 350,
              position: 'absolute',
              top: 50,
              left: -50
            }}
            visible={visible}
            anchor={
              <TouchableOpacity onPress={openMenu} style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Image
                  source={require('../assets/images/option.jpg')}
                  style={{
                    resizeMode: 'center',
                    width: 40,
                    height: 40,
                    marginHorizontal: 5,
                    marginTop: 20,
                    zIndex: 123
                  }}
                />
              </TouchableOpacity>
            }
            onDismiss={closeMenu}
          >
            <Menu.Item
              title="Dashboard"
              onPress={() => {
                navigation.navigate('Dashboard');
                closeMenu();
              }}
            />
            <Menu.Item
              title="User detail"
              onPress={() => {
                navigation.navigate('Placeholder');
                closeMenu();
              }}
            />
            <Menu.Item
              style={{
                width: '70%',
              }}
              onPress={() => {
                navigation.navigate('Settings');
                closeMenu();
              }}
              title="Settings"
            />
            <Menu.Item
              style={{
                width: '70%',
              }}
              onPress={() => {
                navigation.navigate('Drawer');
                closeMenu();
              }}
              title="Change location"
            />
            <Menu.Item
              style={{
                width: '70%',
              }}
              onPress={() => {
                navigation.navigate('AppInfo');
                closeMenu();
              }}
              title="App info / version"
            />
            <Menu.Item
              style={{
                width: '70%',
              }}
              onPress={handleLogout}
              title="Logout"
            />
          </Menu>
        ) : null}
      </View>
    </Provider>
  );
};

export default OptionMenu;
