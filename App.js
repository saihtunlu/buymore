import 'react-native-get-random-values';
import React from 'react';
import {
  StyleSheet,
  View,
  RefreshControl,
  Image,
  ScrollView,
  Text,
  BackHandler,
  StatusBar,
  Dimensions,
} from 'react-native';
import ProgressWebView from 'react-native-progress-webview';
const windowHeight = Dimensions.get('window').height;
import Geolocation from '@react-native-community/geolocation';
// prettier-ignore
const INJECTED_JS = `
  window.onscroll = function() {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        scrollTop: document.documentElement.scrollTop || document.body.scrollTop
      }),     
    )
  }`;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      refreshing: false,
      isLoadingError: false,
      CanGoBack: false,
      isPullToRefreshEnabled: false,
    };
    this.WEBVIEW_REF = React.createRef();
  }
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    Geolocation.getCurrentPosition((info) => console.log(info));
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  onRefresh = () => this.WEBVIEW_REF.reload();

  handleBackButton = () => {
    const {CanGoBack} = this.state;
    if (CanGoBack) {
      this.WEBVIEW_REF.current.goBack();
      return true;
    } else {
      return false;
    }
  };
  refreshWebview = () => {
    this.WEBVIEW_REF.reload();
  };
  onRefresh = () => {
    this.setState({refreshing: true});

    this.WEBVIEW_REF.current.reload();
    this.setState({refreshing: false, isLoadingError: false});
  };

  RenderErrorScreen = () => {
    return (
      <View style={styles.ErrorPage}>
        <Image
          source={require('./assets/images/offline.png')}
          style={styles.Errorlogo}
          resizeMode="contain"
        />
        <Text style={styles.fail}>Connection failed, Please try again!</Text>
      </View>
    );
  };
  onWebViewMessage = (e) => {
    const {data} = e.nativeEvent;
    console.log('App -> onWebViewMessage -> data', data);

    try {
      const {scrollTop} = JSON.parse(data);
      this.setState({isPullToRefreshEnabled: scrollTop === 0});
    } catch (error) {}
  };
  render() {
    const {isPullToRefreshEnabled} = this.state;
    return (
      <ScrollView
        style={{flex: 1, height: '100%'}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            enabled={isPullToRefreshEnabled}
            onRefresh={this.onRefresh}
            tintColor="transparent"
            colors={['transparent']}
            style={{backgroundColor: 'transparent'}}
          />
        }>
        {this.state.isLoadingError ? this.RenderErrorScreen() : null}
        <ProgressWebView
          style={{
            height: windowHeight - StatusBar.currentHeight,
            position: this.state.isLoadingError ? 'absolute' : null,
          }}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          geolocationEnabled={true}
          javaScriptEnabled={true}
          showsVerticalScrollIndicator={false}
          ref={this.WEBVIEW_REF}
          startInLoadingState={true}
          injectedJavaScript={INJECTED_JS}
          onMessage={this.onWebViewMessage}
          renderLoading={() => <SplashScreen />}
          onError={() =>
            this.setState({isLoadingError: true, isPullToRefreshEnabled: true})
          }
          source={{uri: 'https://buymore.com.mm/mobile-home'}}
          onNavigationStateChange={(navState) => {
            this.setState({CanGoBack: navState.canGoBack});
          }}
        />
      </ScrollView>
    );
  }
}
class SplashScreen extends React.Component {
  render() {
    return (
      <View style={styles.viewStyles}>
        <Image
          source={require('./assets/images/loader.gif')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  ErrorPage: {
    minHeight: windowHeight - StatusBar.currentHeight,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  viewStyles: {
    zIndex: 1000,
    flex: 1,
    minHeight: windowHeight - StatusBar.currentHeight,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  Errorlogo: {
    maxWidth: 250,
  },
  logo: {
    maxWidth: '100%',
  },
  fail: {
    top: '65%',
    fontSize: 12,
    position: 'absolute',
    color: '#666',
  },
});
