  
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import HomeScreen from './src/components/home/home-page';
import CameraPage from "./src/components/camera/camera-page";
import GalleryPage from "./src/components/gallery/gallery-page";

console.ignoredYellowBox = ["Setting a timer"];

const MainNavigator =  createStackNavigator({
    Home: HomeScreen,
    Camera: CameraPage,
    Gallery: GalleryPage
});

const Root = createAppContainer(MainNavigator);
export default Root;