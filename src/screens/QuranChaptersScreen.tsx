import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const QuranChaptersScreen = ({ audioFiles }) => {
  const navigation = useNavigation();
  const chapters = Array.from({ length: 114 }, (_, i) => i + 1);

  return (
    <FlatList
      data={chapters}
      keyExtractor={(item) => item.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('ChapterDetail', { chapterNumber: item, audioFiles })}
        >
          <View style={styles.chapterContainer}>
            <Text>Chapter {item}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  chapterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default QuranChaptersScreen;
