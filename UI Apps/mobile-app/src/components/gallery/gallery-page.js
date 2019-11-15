import React from 'react';
import { View, Text } from 'react-native';

export default class GalleryPage extends React.Component {
    camera = null;
    
    state = {
        hasCameraPermission: null,
    };

    /* Mounting Phase */
    async componentDidMount() {

    }

    render() {
        return(
        <View>
            <Text>Gallery Page.</Text>
        </View>
        );
    }
}