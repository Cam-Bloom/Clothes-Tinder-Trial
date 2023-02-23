import React, { useState, useRef, createRef, useEffect } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import data from "../data.js";
import Swiper from "react-native-deck-swiper";
import { IconButton } from "@react-native-material/core";
import { colors, listOfAvoidWords } from "../assets/utils/variables.js";
import {
  suggestedClothes,
  patchUserPreferences,
  getUser,
} from "../assets/utils/api.js";

const SwipePage = ({ setFavourites }) => {
  const swiperRef = createRef();
  const [clothesData, setClothesData] = useState(data);
  const [index, setIndex] = useState(1);
  const [tapCount, setTapCount] = useState(0);
  const [lastTime, setLastTime] = useState(0);
  const [preferences, setPreferences] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      Promise.all([suggestedClothes(32342341), getUser(32342341)]).then(
        ([clothesFromAPI, userFromAPI]) => {
          setClothesData(clothesFromAPI.data.suggestedClothes);
          const existPreferences = userFromAPI.data.user.preferences;
          const onLoadPreferences = preferences.concat(existPreferences);
          setPreferences(onLoadPreferences);
          console.log(preferences, "--onload");
        }
      );
    } catch (err) {
      setError(err);
      console.log(err);
    }
  }, []);

  useEffect(() => {
    if (index % 5 === 0 && index % 10 !== 0) {
      try {
        suggestedClothes(32342341).then((clothesFromAPI) => {
          const newdata = clothesData.concat(
            clothesFromAPI.data.suggestedClothes
          );
          setClothesData(newdata);
        });
      } catch (err) {
        console.log(err);
      }
    }
  }, [index]);

  useEffect(() => {
    if (index % 10 === 0) {
      try {
        patchUserPreferences(32342341, { preferences }).then((res) => {
          console.log(res.data.user.preferences, "----reply data");
        });
      } catch (err) {
        console.log(err);
      }
    }
  }, [index]);

  const handleSwipeOnPress = (preference) => {
    preference === 1
      ? swiperRef.current.swipeRight()
      : swiperRef.current.swipeLeft();
  };

  const handleSwipe = (preference) => {
    preference === 1 ? console.log("like") : console.log("nope");
    setIndex((currentIndex) => currentIndex + 1);
    console.log(index);
    if (preference === 1) {
      updatePreference(clothesData[index]);
    }
  };

  const updatePreference = (item) => {
    const newPreferenceStr = ` ${item.title} ${item.color} `;
    const updatedPreferences = preferences.concat(newPreferenceStr);
    const filteredPreferences = getFilteredPreferences(updatedPreferences);
    setPreferences(filteredPreferences);
    console.log(preferences, "---updated and filtered");
  };

  const getFilteredPreferences = (str) => {
    let arrayWords = str.split(" ").map((word) => word.toLowerCase());
    const uniqWords = [...new Set(arrayWords)];
    const filteredStr = uniqWords
      .filter((word) => !listOfAvoidWords.includes(word))
      .join(" ");
    return filteredStr;
  };

  const handleSwipeBack = () => {
    swiperRef.current.swipeBack();
    setIndex((currentIndex) => currentIndex - 1);
  };

  const handleDoubleTap = (card) => {
    const myTime = new Date();
    const mySec = myTime.getTime();
    if (mySec - lastTime < 250) {
      handleAddToFavorite(card);
      setTapCount(2);
    }
    setLastTime(mySec);
  };

  const handleAddToFavorite = (card) => {
    console.log("Added to favourite");
    setFavourites((currCards) => [card, ...currCards]); //check for error in adding favourites
    console.log(card);
    handleSwipeOnPress(1);
    setTapCount(0);
  };

  const Card = ({ card }) => {
    return (
      <View style={styles.card}>
        <Image
          source={{ uri: `https://${card.item_img_url}` }}
          style={styles.cardImage}
        />
        <Text style={styles.cardTitle}>{card.title}</Text>
      </View>
    );
  };

  const Buttons = () => {
    return (
      <View style={styles.icons}>
        <IconButton
          icon={(props) => <Icon name="back" {...props} />}
          color={colors.darkgrey}
          size={30}
          backgroundColor={colors.white}
          borderWidth={1}
          borderColor={colors.border}
          onPress={() => handleSwipeBack()}
        />
        <Icon
          name="closecircle"
          size={70}
          color={colors.red}
          onPress={() => handleSwipeOnPress(-1)}
        />
        <Icon
          name="checkcircle"
          size={70}
          color={colors.green}
          onPress={() => handleSwipeOnPress(1)}
        />
        <IconButton
          icon={(props) => <Icon name="heart" {...props} />}
          color={colors.red}
          size={30}
          backgroundColor={colors.white}
          borderWidth={1}
          borderColor={colors.border}
          onPress={() => handleAddToFavorite(clothesData[index])}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* DISPLAY ERROR  */}
      {error && (
        <Text style={styles.errorText}>
          An error occurred trying to fetch the data. Put a button here, try
          again?
        </Text>
      )}
      {!error && (
        <>
          <Swiper
            ref={swiperRef}
            cards={clothesData}
            cardIndex={index}
            renderCard={(card) => <Card card={card} />}
            onSwipedRight={() => handleSwipe(1)}
            onSwipedLeft={() => handleSwipe(-1)}
            onTapCard={(cardIndex) => handleDoubleTap(clothesData[cardIndex])}
            stackSize={5}
            stackSeparation={10}
            infinite={false}
            backgroundColor={colors.white}
            verticalSwipe={false}
            disableBottomSwipe
            disableTopSwipe
            style={styles.swiper}
            animateCardOpacity
            overlayLabels={{
              left: {
                title: "NOPE",
                style: {
                  label: styles.overlayLabelsLeftLabel,
                  wrapper: styles.overlayLabelsLeftWrapper,
                },
              },
              right: {
                title: "LIKE",
                style: {
                  label: styles.overlayLabelsRightLabel,
                  wrapper: styles.overlayLabelsRightWrapper,
                },
              },
            }}
          />
          <Buttons />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  swiper: {
    position: "relative",
  },
  overlayLabelsLeftLabel: {
    color: colors.white,
    backgroundColor: colors.red,
    padding: 15,
    fontSize: 26,
  },
  overlayLabelsLeftWrapper: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  overlayLabelsRightLabel: {
    color: colors.white,
    backgroundColor: colors.green,
    padding: 15,
    fontSize: 26,
  },
  overlayLabelsRightWrapper: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  card: {
    flex: 0.65,
    borderRadius: 20,
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingBottom: 25,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
  },
  cardImage: {
    position: "relative",
    width: "100%",
    flex: 1,
    resizeMode: "cover",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 25,
    marginLeft: 5,
    marginRight: 5,
  },
  icons: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    position: "absolute",
    bottom: 50,
  },
  heartContainer: {
    position: "absolute",
    top: "30%",
    left: "45%",
    zIndex: 500,
  },
});

export default SwipePage;
