/**
 * Sample React Native App using react-native-simple-auth.
 * To run on a mac from the project home dir:
 *
 * 1. Create secrets.js from secrets.example.js template
 * 2. `npm install`
 * 3. `pod install`
 * 3. `open ./ReactNativeSimpleAuthExample.xcworkspace/`
 * 4. Then in xcode hit cmd + r
 *
 * https://github.com/facebook/react-native
 */
'use strict';

import React, { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppRegistry,
  Image,
  Navigator,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import simpleAuthClient from 'react-native-simple-auth';
import secrets from './secrets';

class Profile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: this.getName(props.provider),
      picture: this.getPictureLink(props.provider)
    };
  }

  render() {
    return (
      <View style={styles.content}>
        <Image style={styles.pic} source={{uri: this.state.picture }} />
        <Text style={styles.header}>{this.state.name}</Text>
        <View style={styles.scroll}>
          <Text style={styles.mono}>{JSON.stringify(this.props.info, null, 4)}</Text>
        </View>
      </View>
    )
  }

  getName(provider) {
    switch (provider) {
      case 'instagram':
        return this.props.info.data.full_name;
      case 'linkedin-web':
        return `${this.props.info.firstName} ${this.props.info.lastName}`;
      default:
        return this.props.info.name
    }
  }

  getPictureLink(provider) {
    switch (provider) {
      case 'google-web':
        return this.props.info.picture;
      case 'facebook':
        return `https://graph.facebook.com/${this.props.info.id}/picture?type=square`
      case 'twitter':
        return this.props.info.profile_image_url_https;
      case 'instagram':
        return this.props.info.data.profile_picture;
      case 'tumblr':
        return `https://api.tumblr.com/v2/blog/${this.props.info.name}.tumblr.com/avatar/96`;
      case 'linkedin-web':
        var profileUrl = `https://api.linkedin.com/v1/people/~:(picture-url)?oauth2_access_token=${this.props.info.token}&format=json`
        fetch(profileUrl)
          .then(response => response.json())
          .then(responseJson => {
            this.setState({ picture: responseJson.pictureUrl });
          });
        return '';
    }
  }

}

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  componentWillMount() {
    simpleAuthClient.configure(secrets).catch(() => {
      console.log('foo');
    })
  }

  render() {
    return (
      <View style={styles.content}>
        {
          this.state.loading ? null : this.props.authProviders.map((provider, i) => {
            return (
              <TouchableHighlight
                key={provider}
                style={[styles.button, styles[provider]]}
                onPress={this.onBtnPressed.bind(this, provider)}>
                <Text style={[styles.buttonText]}>{provider.split('-')[0]}</Text>
              </TouchableHighlight>
            );
          })
        }
        <ActivityIndicator
            animating={this.state.loading}
            style={[styles.loading]}
            size='large' />
      </View>
    );
  }

  onBtnPressed(provider) {
    const _this = this;
    this.setState({
      loading: true
    });
    simpleAuthClient
      .authorize(provider)
    // Promise.resolve({})
      .then((info) => {
        _this.props.navigator.push({
          title: provider,
          provider,
          info,
          index: 1
        });
        _this.setState({
          loading: false
        });
      })
      .catch((error) => {
        Alert.alert(
          'Authorize Error',
          error && error.description || 'Unknown'
        );
        _this.setState({
          loading: false
        });
      });
  }

}

export default class ReactNativeSimpleAuthExample extends Component {
  render() {
    return (
      <Navigator
        style={styles.container}
        initialRoute={{
          title: 'Simple Auth',
          authProviders: [
            'google-web',
            'facebook',
            'twitter',
            'instagram',
            'tumblr',
            'linkedin-web'
          ],
          index: 0
        }}
        renderScene={(route, navigator) => {
          return route.info ?
            <Profile
              info={route.info}
              provider={route.provider} /> :
            <Login
              title={route.title}
              authProviders={route.authProviders}
              navigator={navigator} />
        }}
        navigationBar={
          <Navigator.NavigationBar
            routeMapper={{
              LeftButton: (route, navigator, index, navState) => {
                if (index === 0) {
                  return null;
                } else {
                  return (
                    <TouchableHighlight onPress={() => navigator.pop()}>
                      <Text style={{ padding: 15 }}>Back</Text>
                    </TouchableHighlight>
                  );
                }
              },
              RightButton: (route, navigator, index, navState) => {
                return null;
              },
              Title: (route, navigator, index, navState) => {
                return <Text style={{ padding: 15 }}>ReactNativeSimpleAuthExample</Text>;
              },
            }}
            style={{
              backgroundColor: 'lightgray'
            }}
          />
        }
      />
    );
  }
}

let styles = StyleSheet.create({
  text: {
    color: 'black',
    backgroundColor: 'white',
    fontSize: 30
  },
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    marginTop: 80,
    marginRight: 10,
    marginLeft: 10
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    alignSelf: 'center'
  },
  button: {
    height: 36,
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'center'
  },
  pic: {
    width: 100,
    height: 100
  },
  mono: {
    fontFamily: 'Menlo',
    paddingTop: 10
  },
  scroll: {
    marginTop: 0,
    paddingTop: 0,
    backgroundColor: '#f2f2f2',
    borderColor: '#888',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    flexDirection: 'row'
  },
  header: {
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    fontSize: 16
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  'google-web': {
    backgroundColor: '#ccc'
  },
  facebook: {
    backgroundColor: '#3b5998'
  },
  twitter: {
    backgroundColor: '#48BBEC'
  },
  instagram: {
    backgroundColor: '#3F729B'
  },
  tumblr: {
    backgroundColor: '#36465D'
  },
  'linkedin-web': {
    backgroundColor: '#0077B5'
  }
});
