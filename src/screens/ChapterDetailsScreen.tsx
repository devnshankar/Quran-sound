import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import Sound from 'react-native-sound';

const audioBaseUrl = 'https://verses.quran.com/'; // Base URL for audio files

Sound.setCategory('Playback', true);

const ChapterDetailScreen = ({ route }) => {
  const { chapterNumber } = route.params;
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingVerse, setPlayingVerse] = useState(null);
  const [audioPlayers, setAudioPlayers] = useState({});
  const [segments, setSegments] = useState({});
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const fetchVersesAndSegments = async () => {
      try {
        const versesResponse = await axios.get(`https://api.quran.com/api/v4/quran/verses/uthmani`, {
          params: {
            chapter_number: chapterNumber,
            words: true,
          },
        });
        console.log(JSON.stringify(versesResponse.data, null, 2))
        setVerses(versesResponse.data.verses || []);

        const segmentsResponse = await axios.get(
          `https://api.quran.com/api/v4/recitations/1/by_chapter/${chapterNumber}?fields=segments`
        );

        console.log(JSON.stringify(segmentsResponse.data, null, 2))
        const audioData = segmentsResponse.data.audio_files || [];

        // Map segments by verse_key
        const segmentsByVerse = audioData.reduce((acc, audioFile) => {
          acc[audioFile.verse_key] = {
            segments: audioFile.segments,
            url: audioFile.url,
          };
          return acc;
        }, {});

        setSegments(segmentsByVerse);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchVersesAndSegments();
  }, [chapterNumber]);

  const handlePlay = (verseKey) => {
    if (playingVerse) {
      audioPlayers[playingVerse]?.stop(() => {
        audioPlayers[playingVerse]?.release();
        playVerse(verseKey);
      });
    } else {
      playVerse(verseKey);
    }
  };

  const playVerse = (verseKey) => {
    const audioFileUrl = segments[verseKey]?.url;
    if (audioFileUrl) {
      // Append the correct domain to the URL
      const completeAudioUrl = `${audioBaseUrl}${audioFileUrl}`;
      console.log(completeAudioUrl)
      const newSound = new Sound(completeAudioUrl, null, (error) => {
        if (error) {
          console.log('Failed to load the sound', error);
          return;
        }
        setPlayingVerse(verseKey);
        setCurrentTime(0);

        newSound.play(() => {
          newSound.release();
          setPlayingVerse(null);
          setCurrentTime(0);
        });

        const interval = setInterval(() => {
          newSound.getCurrentTime((time) => {
            setCurrentTime(time * 1000);
          });
        }, 100);

        newSound.onStop = () => clearInterval(interval);
        newSound.onEnd = () => clearInterval(interval);
      });

      setAudioPlayers((prev) => ({
        ...prev,
        [verseKey]: newSound,
      }));
    }
  };

  const renderVerseText = (textUthmani, verseKey) => {
    if (!segments[verseKey] || playingVerse !== verseKey) {
      return <Text style={styles.defaultText}>{textUthmani}</Text>;
    }

    const textParts = textUthmani.split(' ');

    const highlightedParts = textParts.map((part, index) => {
      const segment = segments[verseKey]?.segments?.find(
        (seg) => currentTime >= parseInt(seg[2]) && currentTime <= parseInt(seg[3])
      );

      if (segment && index >= parseInt(segment[0]) && index <= parseInt(segment[1])) {
        return <Text key={index} style={styles.highlightedText}>{part} </Text>;
      } else {
        return <Text key={index} style={styles.defaultText}>{part} </Text>;
      }
    });

    return <Text>{highlightedParts}</Text>;
  };

  const renderVerseItem = ({ item }) => {
    const textUthmani = item.text_uthmani || '';
    const verseKey = item.verse_key;

    const isPlaying = playingVerse === verseKey;

    return (
      <View style={styles.verseContainer}>
        <Text style={styles.verseText}>{renderVerseText(textUthmani, verseKey)}</Text>
        {segments[verseKey] && (
          <View style={styles.buttonContainer}>
            <Button title="Play" onPress={() => handlePlay(verseKey)} disabled={isPlaying} />
            <Button title="Pause" onPress={() => audioPlayers[verseKey]?.pause()} disabled={!isPlaying} />
            <Button title="Resume" onPress={() => audioPlayers[verseKey]?.play()} disabled={!isPlaying} />
            <Button title="Stop" onPress={() => audioPlayers[verseKey]?.stop()} disabled={!isPlaying} />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <FlatList
      data={verses}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderVerseItem}
    />
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  defaultText: {
    color: 'black',
  },
  highlightedText: {
    color: 'green',
  },
});

export default ChapterDetailScreen;
