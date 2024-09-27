import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import Sound from 'react-native-sound';

Sound.setCategory('Playback', true);

const AudioPlayerCard = () => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [verses, setVerses] = useState([]);

  // Custom intervals for each verse in milliseconds
  const verseTimings = {
    1: 6000, // First verse highlighted for 6 seconds
    2: 6000, // Second verse highlighted for 6 seconds
    3: 6000, // Third verse highlighted for 6 seconds
    4: 4000, // Fourth verse highlighted for 4 seconds
    5: 5000, // Fifth verse highlighted for 5 seconds
    6: 6000, // Sixth verse highlighted for 6 seconds
    7: 6000, // Seventh verse highlighted for 6 seconds
  };

  useEffect(() => {
    // Fetch the data from the API
    fetch('https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran.json')
      .then((response) => response.json())
      .then((data) => {
        const firstSurah = data[0]; // Get the first Surah (Al-Fatihah)
        setVerses(firstSurah.verses);
      })
      .catch((error) => console.log('Failed to fetch Quran data', error));
  }, []);

  useEffect(() => {
    const audioUrl = 'https://2cf8-2405-201-a005-e965-1526-ca68-f154-8f82.ngrok-free.app/assets/quran.mp3';
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
        setCurrentVerse(0); // Reset the verse highlighting when playback finishes
      });
      setIsPlaying(true);
      startHighlightingVerses();
    }
  };

  const startHighlightingVerses = () => {
    let verseIndex = 0;

    const highlightNextVerse = () => {
      if (verseIndex < verses.length) {
        setCurrentVerse(verseIndex);

        const currentVerseId = verses[verseIndex].id;
        const interval = verseTimings[currentVerseId] || 3000; // Default to 3 seconds if not specified

        setTimeout(() => {
          verseIndex++;
          highlightNextVerse();
        }, interval);
      }
    };

    highlightNextVerse();
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
        setCurrentVerse(0); // Reset the verse highlighting when stopped
        console.log('Sound stopped');
      });
    }
  };

  const restartSound = () => {
    if (sound) {
      sound.stop(() => {
        sound.setCurrentTime(0);
        playSound();
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
    <View style={styles.card}>
      <Text style={styles.title}>Audio Player with Quran Subtitles</Text>
      <ScrollView style={styles.versesContainer}>
        {verses.map((verse, index) => (
          <Text
            key={verse.id}
            style={[
              styles.verseText,
              { color: index === currentVerse ? 'green' : 'black' },
            ]}
          >
            {verse.text}
          </Text>
        ))}
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
    maxHeight: 200,
  },
  verseText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default AudioPlayerCard;
