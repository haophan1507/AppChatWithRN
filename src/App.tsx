import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {
  createContext,
  Dispatch,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {ActivityIndicator, Image, Text, View} from 'react-native';
import Chat from './screens/Chat';
import Home from './screens/Home';
import Login from './screens/Login';
import SignUp from './screens/SignUp';

const catImageUrl =
  'https://i.guim.co.uk/img/media/26392d05302e02f7bf4eb143bb84c8097d09144b/446_167_3683_2210/master/3683.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=49ed3252c0b2ffb49cf8b508892e452d';

const Stack = createNativeStackNavigator();
const AuthenticatedUserContext = createContext<{
  user: FirebaseAuthTypes.User | null;
  setUser: Dispatch<React.SetStateAction<FirebaseAuthTypes.User | null>>;
}>({
  user: null,
  setUser: function (): void {},
});

const AuthenticatedUserProvider = ({children}: PropsWithChildren) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  return (
    <AuthenticatedUserContext.Provider value={{user, setUser}}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};

const ChatStack = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerLeft: () => <Text style={{marginLeft: 15}}>Search</Text>,
          headerRight: () => (
            <Image
              source={{uri: catImageUrl}}
              style={{
                width: 40,
                height: 40,
                marginRight: 15,
              }}
            />
          ),
        }}
      />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  );
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={SignUp} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const {user, setUser} = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(
      async authenticatedUser => {
        authenticatedUser ? setUser(authenticatedUser) : setUser(null);
        setIsLoading(false);
      },
    );

    return unsubscribeAuth;
  }, [setUser, user]);

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <ChatStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
const App = () => {
  return (
    <AuthenticatedUserProvider>
      <RootNavigator />
    </AuthenticatedUserProvider>
  );
};

export default App;
