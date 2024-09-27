import React from "react";
import { StyleSheet, Text, View } from "react-native";

const SubtitleCard: React.FC = () => {
	const styles = StyleSheet.create({
		container: {
			alignItems: "center",
			backgroundColor: "gray",
			width: 370,
			borderRadius: 10,
			marginTop: 20,
            justifyContent: "center",
		},
        buttoncontainer: {
            display: "flex",
            flexDirection: "row",
			alignItems: "center",
			backgroundColor: "gray",
			width: 370,
			borderRadius: 10,
            justifyContent: "space-around",
		},
        text: {
            color: "white",
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 10,
            textAlign: "center",

        },
        textRead: {
            color: "blue",
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 10,
            textAlign: "center",
        }
	});
	return (
		<View style={styles.container}>
			<View style={styles.buttoncontainer}>
                <Text style={styles.text}>the quran text here map them out but make the api call to get the text </Text>
			</View>
		</View>
	);
};

export default SubtitleCard;
