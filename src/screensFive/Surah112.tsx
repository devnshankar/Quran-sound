import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import Sound from 'react-native-sound';

const surahUrl = 'https://eagle-devoted-lab.ngrok-free.app/assets/surah112-ai-gen-4.json';
const audioUrl = 'https://eagle-devoted-lab.ngrok-free.app/assets/surah112.mp3';

Sound.setCategory('Playback', true);

const Surah112 = () => {
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const soundRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(surahUrl);
        setVerses(response.data.verses);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const playAudio = () => {
    if (soundRef.current) {
      soundRef.current.stop(() => soundRef.current.release());
    }

    soundRef.current = new Sound(audioUrl, null, (error) => {
      if (error) {
        console.error('Failed to load sound', error);
        return;
      }
      soundRef.current.play();

      const interval = setInterval(() => {
        soundRef.current.getCurrentTime((seconds) => {
          setCurrentTime(seconds);
          highlightWordSequentially(seconds);
        });
      }, 200); // Adjusted interval to reduce desynchronization

      soundRef.current.onEnd = () => clearInterval(interval);
    });
  };

  const pauseAudio = () => {
    if (soundRef.current) {
      soundRef.current.pause();
    }
  };

  const restartAudio = () => {
    if (soundRef.current) {
      soundRef.current.setCurrentTime(0);
      playAudio();
    }
  };

  const highlightWordSequentially = (currentTime) => {
    let newWordIndex = null;
    let newVerseIndex = null;

    for (let vIndex = 0; vIndex < verses.length; vIndex++) {
      const verse = verses[vIndex];

      for (let wIndex = 0; wIndex < verse.words.length; wIndex++) {
        const word = verse.words[wIndex];

        // Ensure the time check includes an equal or very close match to the word's duration
        if (currentTime >= word.start && currentTime <= word.end) {
          newWordIndex = wIndex;
          newVerseIndex = vIndex;
          setCurrentWord(word.word); // Set the current word being played
          break;
        }
      }

      if (newWordIndex !== null) break;
    }

    setCurrentWordIndex(newWordIndex);
    setCurrentVerseIndex(newVerseIndex);
  };

  const renderVerse = ({ item, index }) => (
    <View style={styles.verseContainer}>
      <Text style={styles.verseText}>
        {item.words.map((word, wordIndex) => (
          <Text
            key={word.id}
            style={
              index === currentVerseIndex && wordIndex === currentWordIndex
                ? styles.highlightedText
                : styles.defaultText
            }
          >
            {word.word}{' '}
          </Text>
        ))}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList data={verses} renderItem={renderVerse} keyExtractor={(item) => item.id.toString()} />
      <Button title="Play Surah" onPress={playAudio} />
      <Button title="Pause Surah" onPress={pauseAudio} />
      <Button title="Restart Surah" onPress={restartAudio} />
      <Text style={styles.wordInfo}>
        Current Word: {currentWord || 'None'} {'\n'}
        Time: {currentTime ? `${Math.floor(currentTime)}s ${Math.floor((currentTime % 1) * 1000)}ms` : '0s 0ms'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseContainer: {
    paddingBottom: 20,
  },
  verseText: {
    fontSize: 28,
  },
  defaultText: {
    color: 'black',
  },
  highlightedText: {
    color: 'green',
  },
  wordInfo: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Surah112;
