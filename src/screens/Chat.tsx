import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {GiftedChat, IMessage} from 'react-native-gifted-chat';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

function Chat() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const navigation = useNavigation();

  const onSignOut = () => {
    auth()
      .signOut()
      .catch(error => console.log('Error logging out: ', error));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10,
          }}
          onPress={onSignOut}>
          <Text style={{marginRight: 10}}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useLayoutEffect(() => {
    const collectionRef = firestore().collection('chats');
    collectionRef
      .orderBy('createdAt', 'desc')
      .get()
      .then(querySnapshot =>
        setMessages(
          querySnapshot.docs.map(doc => ({
            _id: doc.data()._id,
            createdAt: doc.data().createdAt.toDate(),
            text: doc.data().text,
            user: doc.data().user,
          })),
        ),
      );
  }, []);

  const onSend = useCallback((m: IMessage[] = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, m));
    // setMessages([...messages, ...messages]);
    const {_id, createdAt, text, user} = m[0];

    firestore()
      .collection('chats')
      .add({
        _id,
        createdAt,
        text,
        user,
      })
      .then(() => {
        console.log('User added!');
      });
  }, []);

  return (
    <View style={{flex: 1, paddingBottom: 40, backgroundColor: '#fff'}}>
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={false}
        wrapInSafeArea={false}
        showUserAvatar={false}
        onSend={m => onSend(m)}
        messagesContainerStyle={{
          backgroundColor: '#fff',
        }}
        textInputProps={{
          backgroundColor: '#fff',
          borderRadius: 20,
        }}
        user={{
          _id: auth()?.currentUser?.email || '',
          avatar: 'https://i.pravatar.cc/300',
        }}
      />
    </View>
  );
}

export default Chat;
