import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import Sound from 'react-native-sound';

Sound.setCategory('Playback', true);

const AudioControls = ({ audioUrl }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAndPlaySound = () => {
    setLoading(true);
    const newSound = new Sound(audioUrl, null, (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
        setLoading(false);
        return;
      }
      setSound(newSound);
      playSound();
    });
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
        setLoading(false);
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
        playSound();
        console.log('Sound restarted');
      });
    }
  };

  const resumeSound = () => {
    if (sound && !isPlaying) {
      playSound();
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default AudioControls;
