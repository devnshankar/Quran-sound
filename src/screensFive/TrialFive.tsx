import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import axios from 'axios';
import QuranChaptersScreen from './QuranChaptersScreen';
import ChapterDetailScreen from './ChapterDetailsScreen';
import Surah112 from './Surah112';

const Stack = createStackNavigator();
const baseUrl = 'https://api.quran.com/api/v4';
const recitationId = 1; // Recitation id for AbdulBaset Mujawwad

const TrialFive = () => {
  const [audioFiles, setAudioFiles] = useState({});

  useEffect(() => {
    const fetchAllAudioFiles = async () => {
      try {
        const response = await axios.get(`${baseUrl}/quran/recitations/${recitationId}`);
        const audioFilesData = response.data.audio_files.reduce((acc, file) => {
          acc[file.verse_key] = file.url;
          return acc;
        }, {});
        setAudioFiles(audioFilesData);
      } catch (error) {
        console.error('Failed to fetch audio files:', error);
      }
    };

    fetchAllAudioFiles();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Surah112">
          {props => <Surah112 {...props}/>}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default TrialFive;
