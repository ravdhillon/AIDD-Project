import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Permissions from 'expo-permissions';
import {Camera} from 'expo-camera';
import Toolbar from '../toolbar/toolbar';

export default class CameraPage extends React.Component {
    camera = null;
    
    state = {
      captures: [],
      capturing: null,
      hasCameraPermission: null,        
    };
  
    handleCaptureIn = () => this.setState({ capturing: true });
    
    handleShortCapture = async () => {
      const photoData = await this.camera.takePictureAsync();
      this.setState({ capturing: false, captures: [photoData, ...this.state.captures] })
    };

    /* Mounting Phase */
    async componentDidMount() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    }

    render() {
      const { hasCameraPermission, capturing, captures } = this.state;
      if (hasCameraPermission === null) {
        return <View />;
      } else if (hasCameraPermission === false) {
        return <Text>No access to camera</Text>;
      } else {
        return (
          <View style={{ flex: 1 }}>
            <Camera style={{ flex: 1 }}
                    type={this.state.type}
                    ref={camera => this.camera = camera}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                }}>
                <TouchableOpacity
                  style={{
                    flex: 0.1,
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    this.setState({
                      type:
                        this.state.type === Camera.Constants.Type.back
                          ? Camera.Constants.Type.front
                          : Camera.Constants.Type.back,
                    });
                  }}>
                  <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Flip </Text>
                </TouchableOpacity>
              </View>
            </Camera>
            <Toolbar 
                    capturing={capturing}
                    onCaptureIn={this.handleCaptureIn}
                    onShortCapture={this.handleShortCapture}
                />
          </View>
        )
      }
    }
}