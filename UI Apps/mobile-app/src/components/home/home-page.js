import React from 'react'
import {View, Button, Text, StyleSheet } from 'react-native';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title:'Welcome',
    header: null
  };
  constructor(props) {
    super(props);
  }

  _onLoadCameraPage = () => {
    this.props.navigation.navigate("Camera")
  }
  _onLoadGalleryPage = () => {
    this.props.navigation.navigate("Gallery")
  }
  render() {
    return (
      <View style={styles.container}>
        <Text>Auto Claim Estimation App</Text>
        <View style={styles.buttonContainer}>
          <Button
            onPress={this._onLoadCameraPage}
            title="Capture Images"
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            onPress={this._onLoadGalleryPage}
            title="Load Images"
            color="#841584"
          />
        </View>      
      </View>);
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
})
