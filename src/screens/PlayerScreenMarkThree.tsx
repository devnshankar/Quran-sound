import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import Sound from 'react-native-sound';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

Sound.setCategory('Playback', true);

const baseUrl = 'https://api.quran.com/api/v4';
const recitationId = 2; // Example recitation id, update if necessary
const chapters = Array.from({ length: 114 }, (_, i) => i + 1);

const QuranChaptersScreen = () => {
  const navigation = useNavigation();

  return (
    <FlatList
      data={chapters}
      keyExtractor={(item) => item.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('ChapterDetail', { chapterNumber: item })}
        >
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
            <Text>Chapter {item}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

const ChapterDetailScreen = ({ route }) => {
  const { chapterNumber } = route.params;
  const [verses, setVerses] = useState([]);
  const [audioFiles, setAudioFiles] = useState({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchVerses = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${baseUrl}/quran/verses/uthmani`, {
            params: {
              chapter_number: chapterNumber,
              language: 'en',
              words: true,
              translations: '131',
              audio: '2',
            },
          });
          setVerses(response.data.verses || []);
        } catch (error) {
          console.error(error);
        }
      };

      const fetchAudioFiles = async () => {
        try {
          const response = await axios.get(`${baseUrl}/quran/recitations/${recitationId}`, {
            params: {
              chapter_number: chapterNumber,
            },
          });
          const audioFilesData = response.data.audio_files.reduce((acc, file) => {
            acc[file.verse_key] = file.url;
            return acc;
          }, {});
          setAudioFiles(audioFilesData);
        } catch (error) {
          console.error('Failed to fetch audio files:', error);
        }
      };

      fetchVerses();
      fetchAudioFiles();
      setLoading(false);
    }, [chapterNumber])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderVerseItem = ({ item }) => {
    const textUthmani = item.text_uthmani || '';
    const translation = item.translations?.[0]?.text || '';
    const verseKey = item.verse_key;

    return (
      <View style={styles.verseContainer}>
        <Text style={styles.verseText}>{textUthmani}</Text>
        <Text style={styles.translationText}>{translation}</Text>
        {audioFiles[verseKey] && <AudioControls audioUrl={audioFiles[verseKey]} />}
      </View>
    );
  };

  return (
    <FlatList
      data={verses}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderVerseItem}
    />
  );
};

const AudioControls = ({ audioUrl }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAndPlaySound = async () => {
    try {
      setLoading(true);
      const newSound = new Sound(audioUrl, null, (error) => {
        if (error) {
          console.log('Failed to load the sound', error);
          return;
        }
        setSound(newSound);
        playSound();
      });
    } catch (error) {
      console.error('Failed to fetch audio URL:', error);
    } finally {
      setLoading(false);
    }
  };

  const playSound = () => {
    if (sound) {
      sound.play((success) => {
        if (success) {
          console.log('Successfully finished playing');
        } else {
          console.log('Playback failed due to audio decoding errors');
        }
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const pauseSound = () => {
    if (sound && isPlaying) {
      sound.pause(() => {
        setIsPlaying(false);
        console.log('Sound paused');
      });
    }
  };

  const stopSound = () => {
    if (sound) {
      sound.stop(() => {
        setIsPlaying(false);
        console.log('Sound stopped');
      });
    }
  };

  const restartSound = () => {
    if (sound) {
      sound.stop(() => {
        sound.setCurrentTime(0);
        playSound(); // Restart the sound from the beginning
        console.log('Sound restarted');
      });
    }
  };

  const resumeSound = () => {
    if (sound && !isPlaying) {
      sound.play((success) => {
        if (success) {
          console.log('Successfully finished playing');
        } else {
          console.log('Playback failed due to audio decoding errors');
        }
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  return (
    <View style={styles.buttonContainer}>
      <Button title="Play" onPress={fetchAndPlaySound} disabled={isPlaying || loading} />
      <Button title="Pause" onPress={pauseSound} disabled={!isPlaying} />
      <Button title="Resume" onPress={resumeSound} disabled={isPlaying || loading} />
      <Button title="Restart" onPress={restartSound} disabled={loading} />
      <Button title="Stop" onPress={stopSound} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  verseContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  verseText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  translationText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export { QuranChaptersScreen, ChapterDetailScreen };
