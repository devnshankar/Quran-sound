import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import Sound from 'react-native-sound';

Sound.setCategory('Playback', true);

const AudioPlayerCard = () => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [verses, setVerses] = useState([]);
  const [wordTimings, setWordTimings] = useState({});
  const timeoutIdRef = useRef(null);

  useEffect(() => {
    // Fetch the data from the API
    fetch('https://tapir-unbiased-routinely.ngrok-free.app/api/quran')
      .then((response) => response.json())
      .then((data) => {
        const firstSurah = data[0]; // Get the first Surah (Al-Fatihah)
        setVerses(firstSurah.verses);

        // Extract word timings for each verse
        const timings = firstSurah.verses.reduce((acc, verse) => {
          acc[verse.id] = verse.wordTimings;
          return acc;
        }, {});
        setWordTimings(timings);
      })
      .catch((error) => console.log('Failed to fetch Quran data', error));
  }, []);

  useEffect(() => {
    const audioUrl = 'https://tapir-unbiased-routinely.ngrok-free.app/assets/quran.mp3';
    const newSound = new Sound(audioUrl, null, (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
        return;
      }
      setSound(newSound);
    });

    return () => {
      if (sound) {
        sound.release();
      }
      clearTimeout(timeoutIdRef.current);
    };
  }, []);

  const playSound = () => {
    if (sound) {
      sound.play((success) => {
        if (success) {
          console.log('Successfully finished playing');
        } else {
          console.log('Playback failed due to audio decoding errors');
        }
        setIsPlaying(false);
        setCurrentWordIndex(0);
        setCurrentVerseIndex(0);
        clearTimeout(timeoutIdRef.current);
      });
      setIsPlaying(true);
      startHighlightingWords(currentVerseIndex, currentWordIndex);
    }
  };

  const startHighlightingWords = (verseIndex, wordIndex) => {
    const highlightNextWord = () => {
      if (verseIndex < verses.length) {
        const currentVerse = verses[verseIndex];
        const wordsInVerse = currentVerse.text.split(' ');
        const currentVerseId = currentVerse.id;

        if (wordIndex < wordsInVerse.length) {
          setCurrentWordIndex(wordIndex);
          setCurrentVerseIndex(verseIndex);

          const interval = wordTimings[currentVerseId][wordIndex] || 500; // Default to 500ms if not specified

          timeoutIdRef.current = setTimeout(() => {
            wordIndex++;
            highlightNextWord();
          }, interval);
        } else {
          wordIndex = 0;
          verseIndex++;
          highlightNextWord();
        }
      }
    };

    highlightNextWord();
  };

  const pauseSound = () => {
    if (sound && isPlaying) {
      sound.pause(() => {
        setIsPlaying(false);
        console.log('Sound paused');
      });
      clearTimeout(timeoutIdRef.current); // Pause highlighting
    }
  };

  const stopSound = () => {
    if (sound) {
      sound.stop(() => {
        setIsPlaying(false);
        setCurrentWordIndex(0);
        setCurrentVerseIndex(0);
        clearTimeout(timeoutIdRef.current);
        console.log('Sound stopped');
      });
    }
  };

  const restartSound = () => {
    if (sound) {
      sound.stop(() => {
        sound.setCurrentTime(0);
        setCurrentWordIndex(0);
        setCurrentVerseIndex(0);
        playSound(); // Restart the sound and highlighting from the beginning
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
        clearTimeout(timeoutIdRef.current);
      });
      setIsPlaying(true);
      startHighlightingWords(currentVerseIndex, currentWordIndex); // Resume from where it was paused
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Audio Player with Quran Word-by-Word Subtitles</Text>
      <ScrollView style={styles.versesContainer}>
        {verses.map((verse, verseIndex) => {
          const wordsInVerse = verse.text.split(' ');
          return (
            <Text key={verse.id} style={styles.verseText}>
              {wordsInVerse.map((word, wordIndex) => (
                <Text
                  key={`${verse.id}-${wordIndex}`}
                  style={{  
                    color:
                      verseIndex === currentVerseIndex &&
                      wordIndex === currentWordIndex
                        ? 'green'
                        : 'black',
}}
                >
                  {word + ' '}
                </Text>
              ))}
            </Text>
          );
        })}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button title="Play" onPress={playSound} />
        <Button title="Pause" onPress={pauseSound} disabled={!isPlaying} />
        <Button title="Resume" onPress={resumeSound} disabled={isPlaying} />
        <Button title="Restart" onPress={restartSound} />
        <Button title="Stop" onPress={stopSound} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  versesContainer: {
    marginBottom: 20,
    maxHeight: 700,
  },
  verseText: {
    fontSize: 22,
    marginBottom: 5,
    fontWeight: 'bold'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default AudioPlayerCard;
